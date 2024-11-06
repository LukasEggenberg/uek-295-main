export class Security {
  static get secret() {
    return process.env.JWT_SECRET;
  }
}
