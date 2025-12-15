export default class UserManager {
    public static readonly instance: UserManager = new UserManager();

    private constructor() {}

    public getUser(): string {
        return 'respond with a resource';
    }
}
