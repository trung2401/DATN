class UserDTO {
    constructor(user) {
        this.userId = user.UserID;
        this.userName = user.UserName;
        this.gmail = user.Gmail;
        this.name = user.Name;
        this.phone = user.Phone;
        this.role = user.Role ? user.Role.RoleName : null;
        this.roleId = user.RoleID;
        this.status = user.status;
    }
}

module.exports = UserDTO;