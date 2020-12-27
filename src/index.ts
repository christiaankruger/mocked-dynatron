import { Queue } from "./queue";

type TYPE_KNOWN_OPERATIONS = "get" | "query";
const KNOWN_OPERATIONS: TYPE_KNOWN_OPERATIONS[] = ["get", "query"];

type PROXY_TYPE = {
  [key: string]: any;
  $execute: any;
};

export class MockedDynatron {
  private queues: { [key: string]: Queue<object> } = {};

  constructor() {
    // Nothing for now.
  }

  add(operation: TYPE_KNOWN_OPERATIONS, value: object): MockedDynatron {
    if (!KNOWN_OPERATIONS.includes(operation)) {
      throw new Error(`Unknown operation: ${operation}.`);
    }

    if (!this.queues[operation]) {
      this.queues[operation] = new Queue();
    }
    this.queues[operation].push(value);
    return this;
  }

  get implementation(): { [key: string]: any } {
    return KNOWN_OPERATIONS.reduce((memo, op) => {
      const target: PROXY_TYPE = { $execute: {} };

      const opProxy = new Proxy(target, {
        get: (target, p, r) => {
          if (p === "$execute") {
            target[p] = () => this.queues[op].pop();
          } else {
            target[p as string] = () => opProxy;
          }
          return Reflect.get(target, p, r);
        },
      });

      return {
        ...memo,
        [op]: () => opProxy,
      };
    }, {});
  }
}

const m = new MockedDynatron();
m.add("get", { id: 1 });
m.add("get", { id: 2 });

const mm = async () => {
  console.log(await m.implementation.get().x().y().$execute());
  console.log(await m.implementation.get().$execute());
};

mm();
