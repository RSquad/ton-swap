import {
  default as axios,
  AxiosInstance,
} from 'axios';


const apiRoot = 'https://api.blockcypher.com/v1/btc/test3';

const routes = {
  blocks: 'blocks/',
};

const sleep = async (s) => new Promise((resolve) => {
  setTimeout(() => resolve(true), s * 1000);
});

export default
class BlockcypherService {
  private axios: AxiosInstance;

  constructor(/* coin, chain, token */) {
    this.axios = axios.create({
      baseURL: `${ apiRoot }`,
      timeout: 10000,
    });
  }

  async doGet(url, params = {}) {
    let res;
    let err;
    let i = 0;
    while ( i < 3 ) {
      try {
        res = await this.axios.get(url);
      } catch (ex) {
        err = ex;
      }
      if ( !res && i < 3 ) {
        await sleep(0.5);
      }
      i++;
    }
    if ( !res ) {
      throw err;
    }
    return res;
  }

  async doPost(url: string, params) {
    let res;
    let err;
    let i = 0;
    while ( i < 3 ) {
      try {
        res = await this.axios.post(url, params);
      } catch (ex) {
        err = ex;
      }
      if ( !res && i < 3 ) {
        await sleep(0.5);
      }
      i++;
    }
    if ( !res ) {
      throw err;
    }
    return res;
  }

  async getState() {
    return this.doGet('');
  }

  async getBalance(address: string) {
    return this.doGet(`addrs/${ address }/balance`);
  }

  async getTx(txhash: string) {
    return this.doGet(`txs/${ txhash }`);
  }

  async getBlock(hh, params = {
  }) {
    return this.doGet(routes.blocks + hh, params);
  }

  async createTxStub(params: any) {
    return this.doPost('/txs/new', params);
  }

  async sendTx(params: any) {
    return this.doPost('/txs/send', params);
  }
}
