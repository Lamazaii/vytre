export default class HomeManager {
    public static readonly instance: HomeManager = new HomeManager();

    private constructor() {}

    public getHomeTitle() {
        // get data from db here
        return { title: 'Hello World!' };
    }
}
