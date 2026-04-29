-- =====================================================
-- HỆ THỐNG CHAT 1-1 ĐƠN GIẢN
-- Mọi user có thể nhắn tin với giảng viên
-- Không cần đăng ký khóa học
-- =====================================================
 
-- BẢNG 1: Lưu cuộc hội thoại 1-1 giữa 2 người (đơn giản nhất)
DROP TABLE IF EXISTS `conversation`;
CREATE TABLE `conversation` (
  `ConversationID` INT NOT NULL AUTO_INCREMENT,
  `User1ID` INT NOT NULL COMMENT 'User thứ nhất (thường là user thường)',
  `User2ID` INT NOT NULL COMMENT 'User thứ hai (thường là giảng viên)',
  `LastMessage` TEXT COMMENT 'Tin nhắn cuối (preview)',
  `LastMessageTime` DATETIME DEFAULT NULL COMMENT 'Thời gian tin nhắn cuối',
  `UnreadCountUser1` INT DEFAULT 0 COMMENT 'Số tin chưa đọc của User1',
  `UnreadCountUser2` INT DEFAULT 0 COMMENT 'Số tin chưa đọc của User2',
  `CreatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ConversationID`),
  -- Đảm bảo mỗi cặp chỉ có 1 conversation (không quan tâm thứ tự)
  UNIQUE KEY `unique_users` (`User1ID`, `User2ID`),
  KEY `idx_user1` (`User1ID`),
  KEY `idx_user2` (`User2ID`),
  CONSTRAINT `fk_conv_user1` 
    FOREIGN KEY (`User1ID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE,
  CONSTRAINT `fk_conv_user2` 
    FOREIGN KEY (`User2ID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 
-- BẢNG 2: Lưu tin nhắn (không đổi)
DROP TABLE IF EXISTS `message`;
CREATE TABLE `message` (
  `MessageID` INT NOT NULL AUTO_INCREMENT,
  `ConversationID` INT NOT NULL,
  `SenderID` INT NOT NULL COMMENT 'Người gửi',
  `MessageText` TEXT NOT NULL COMMENT 'Nội dung tin nhắn',
  `SentAt` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian gửi',
  `IsRead` TINYINT(1) DEFAULT 0 COMMENT '0=chưa đọc, 1=đã đọc',
  PRIMARY KEY (`MessageID`),
  KEY `idx_conversation` (`ConversationID`, `SentAt`),
  KEY `idx_sender` (`SenderID`),
  CONSTRAINT `fk_msg_conversation` 
    FOREIGN KEY (`ConversationID`) REFERENCES `conversation` (`ConversationID`) ON DELETE CASCADE,
  CONSTRAINT `fk_msg_sender` 
    FOREIGN KEY (`SenderID`) REFERENCES `user` (`UserID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
 
 
-- =====================================================
-- TRIGGER: Tự động cập nhật conversation khi có tin nhắn mới
-- =====================================================
DELIMITER $$
DROP TRIGGER IF EXISTS `after_message_insert`$$
CREATE TRIGGER `after_message_insert`
AFTER INSERT ON `message`
FOR EACH ROW
BEGIN
  DECLARE is_user1_sender BOOLEAN;
  
  -- Lấy thông tin conversation
  SELECT User1ID INTO @user1_id
  FROM conversation WHERE ConversationID = NEW.ConversationID;
  
  -- Xác định ai là người gửi
  SET is_user1_sender = (NEW.SenderID = @user1_id);
  
  -- Cập nhật conversation
  UPDATE conversation
  SET 
    LastMessage = LEFT(NEW.MessageText, 100),
    LastMessageTime = NEW.SentAt,
    UnreadCountUser1 = IF(is_user1_sender, UnreadCountUser1, UnreadCountUser1 + 1),
    UnreadCountUser2 = IF(is_user1_sender, UnreadCountUser2 + 1, UnreadCountUser2)
  WHERE ConversationID = NEW.ConversationID;
END$$
DELIMITER ;
 
 
-- =====================================================
-- STORED PROCEDURE: Tìm hoặc tạo conversation
-- =====================================================
DELIMITER $$
DROP PROCEDURE IF EXISTS `GetOrCreateConversation`$$
CREATE PROCEDURE `GetOrCreateConversation`(
  IN p_user1_id INT,
  IN p_user2_id INT,
  OUT p_conversation_id INT
)
BEGIN
  DECLARE v_conv_id INT DEFAULT NULL;
  DECLARE v_min_user INT;
  DECLARE v_max_user INT;
  
  -- Đảm bảo User1ID < User2ID để tránh duplicate
  IF p_user1_id < p_user2_id THEN
    SET v_min_user = p_user1_id;
    SET v_max_user = p_user2_id;
  ELSE
    SET v_min_user = p_user2_id;
    SET v_max_user = p_user1_id;
  END IF;
  
  -- Tìm conversation
  SELECT ConversationID INTO v_conv_id
  FROM conversation
  WHERE User1ID = v_min_user AND User2ID = v_max_user
  LIMIT 1;
  
  -- Nếu chưa có, tạo mới
  IF v_conv_id IS NULL THEN
    INSERT INTO conversation (User1ID, User2ID)
    VALUES (v_min_user, v_max_user);
    
    SET v_conv_id = LAST_INSERT_ID();
  END IF;
  
  SET p_conversation_id = v_conv_id;
END$$
DELIMITER ;
 
 
-- =====================================================
-- CÁC QUERY CƠ BẢN
-- =====================================================
 
-- Query 1: Lấy hoặc tạo conversation (dùng Stored Procedure)
/*
CALL GetOrCreateConversation(84, 53, @conversationId);
SELECT @conversationId;
*/
 
-- Query 2: Lấy danh sách conversations của một user
/*
SELECT 
  c.ConversationID,
  -- Lấy thông tin người chat (người còn lại)
  IF(c.User1ID = 84, u2.UserID, u1.UserID) AS OtherUserID,
  IF(c.User1ID = 84, u2.Name, u1.Name) AS OtherUserName,
  IF(c.User1ID = 84, u2.Avatar, u1.Avatar) AS OtherUserAvatar,
  c.LastMessage,
  c.LastMessageTime,
  -- Lấy số tin chưa đọc của mình
  IF(c.User1ID = 84, c.UnreadCountUser1, c.UnreadCountUser2) AS UnreadCount
FROM conversation c
LEFT JOIN user u1 ON u1.UserID = c.User1ID
LEFT JOIN user u2 ON u2.UserID = c.User2ID
WHERE c.User1ID = 84 OR c.User2ID = 84
ORDER BY c.LastMessageTime DESC;
*/
 
-- Query 3: Lấy lịch sử tin nhắn (không đổi)
/*
SELECT 
  m.MessageID,
  m.SenderID,
  u.Name AS SenderName,
  m.MessageText,
  m.SentAt,
  m.IsRead
FROM message m
INNER JOIN user u ON u.UserID = m.SenderID
WHERE m.ConversationID = 1
ORDER BY m.SentAt ASC;
*/
 
-- Query 4: Gửi tin nhắn (không đổi)
/*
INSERT INTO message (ConversationID, SenderID, MessageText)
VALUES (1, 84, 'Xin chào, tôi muốn tư vấn về khóa học');
*/
 
-- Query 5: Đánh dấu đã đọc
/*
-- Đánh dấu tin nhắn
UPDATE message
SET IsRead = 1
WHERE ConversationID = 1 
  AND SenderID != 84
  AND IsRead = 0;
 
-- Reset unread count
UPDATE conversation
SET UnreadCountUser1 = IF(User1ID = 84, 0, UnreadCountUser1),
    UnreadCountUser2 = IF(User2ID = 84, 0, UnreadCountUser2)
WHERE ConversationID = 1;
*/
 
-- Query 6: Check xem 2 user đã có conversation chưa
/*
SELECT ConversationID
FROM conversation
WHERE (User1ID = 84 AND User2ID = 53) 
   OR (User1ID = 53 AND User2ID = 84)
LIMIT 1;
*/
 
 
-- =====================================================
-- DỮ LIỆU MẪU
-- =====================================================
 
/*
-- User 84 chat với Teacher 53
CALL GetOrCreateConversation(84, 53, @conv1);
 
INSERT INTO message (ConversationID, SenderID, MessageText) VALUES
(@conv1, 84, 'Xin chào thầy, em muốn hỏi về khóa học TOEIC 900+'),
(@conv1, 53, 'Chào em, thầy sẵn sàng tư vấn cho em nhé'),
(@conv1, 84, 'Thầy có thể cho em biết chi tiết về lộ trình học không ạ?');
 
-- User 85 chat với Teacher 53
CALL GetOrCreateConversation(85, 53, @conv2);
 
INSERT INTO message (ConversationID, SenderID, MessageText) VALUES
(@conv2, 85, 'Thầy ơi, em muốn đăng ký khóa học'),
(@conv2, 53, 'Được em, thầy gửi thông tin cho em nhé');
 
-- Test queries
SELECT * FROM conversation;
SELECT * FROM message;
*/
 
 
-- =====================================================
-- INDEX BỔ SUNG
-- =====================================================
 
-- Tìm conversation nhanh hơn
CREATE INDEX idx_conversation_users ON conversation(User1ID, User2ID);
CREATE INDEX idx_conversation_time ON conversation(LastMessageTime DESC);
 
 
-- =====================================================
-- GHI CHÚ QUAN TRỌNG
-- =====================================================
 
/*
ƯU ĐIỂM CỦA THIẾT KẾ NÀY:
 
1. ĐơN GIẢN HƠN NHIỀU:
   - Không cần CourseID
   - Không cần check đăng ký khóa học
   - Mỗi cặp user chỉ có 1 conversation
 
2. LINH HOẠT:
   - User chưa đăng ký vẫn chat được (tư vấn)
   - User đã đăng ký cũng chat được (hỗ trợ)
   - Giảng viên quản lý tin nhắn từ tất cả user ở 1 chỗ
 
3. DỄ TRIỂN KHAI:
   - Frontend chỉ cần: currentUserId + teacherId
   - Call GetOrCreateConversation
   - Mở chat ngay
 
4. CÁCH SỬ DỤNG:
 
   TẠI TRANG CHỦ / CHI TIẾT KHÓA HỌC:
   - User thấy khóa học của Teacher ID = 53
   - Click "Liên hệ giáo viên"
   - Frontend call: GetOrCreateConversation(currentUserId, 53)
   - Nhận conversationId
   - Mở chat window với conversationId đó
 
5. LƯU Ý:
   - User1ID luôn < User2ID để tránh duplicate
   - Stored Procedure tự động xử lý
   - Trigger tự động cập nhật LastMessage
 
6. MỞ RỘNG (NẾU CẦN):
   - Thêm cột CourseContext: lưu thông tin khóa học được đề cập
   - Thêm bảng conversation_metadata: lưu tags, category
   - Nhưng với đồ án, thiết kế hiện tại là ĐỦ!
*/