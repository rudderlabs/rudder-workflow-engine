export const data = {
  a: {
    b: [
      {
        d: 1,
      },
      {
        e: 2,
      },
    ],
    c: {
      f: 3,
    },
  },
};

export class CustomError extends Error {
  constructor(message: string) {
    super(message);
  }
}
