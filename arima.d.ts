declare module 'arima' {
  interface ARIMAOptions {
    p: number;
    d: number;
    q: number;
  }

  interface ARIMAResult {
    predict(horizon: number): [number[]];
  }

  class ARIMA {
    constructor(options: ARIMAOptions);
    train(data: number[]): ARIMAResult;
  }

  export default ARIMA;
}
