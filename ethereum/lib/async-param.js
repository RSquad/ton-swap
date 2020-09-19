module.exports =

class AsyncParam {

  constructor () {
    this.result;
    this._resolves = [];
    this._rejects = [];
  }

  createPromise () {
    return new Promise((resolve, reject) => {
      if (this.result) {
        if (this.result.value) {
          resolve(this.result.value);
        } else {
          reject(this.result.error);
        }
      } else {
        this._resolves.push(resolve);
        this._rejects.push(reject);
      }
    });
  }

  setResult (res, f) {
    if (this.result) {
      throw new Error('Promise already accomplished');
    }
    this.result = res;
    f();
    this._resolves = [];
    this._rejects = [];
  }

  resolve (value) {
    this.setResult({ value }, () => {
      this._resolves.forEach(v => v(value));
    });
  }

  reject (error) {
    this.setResult({ error }, () => {
      this._rejects.forEach(v => v(error));
    });
  }
}
