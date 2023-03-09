type StateType = "initial" | "pending" | "resolved" | "rejected";
const STATE: { [key: string]: StateType } = {
  INITIAL: "initial",
  PENDING: "pending",
  RESOLVED: "resolved",
  REJECTED: "rejected",
};

export interface Resource {
  read(): any;
  preload(): void;
}

/**
 * <Suspense /> 组件对应的 resource 创建函数，放置于 <Suspense />
 * @param load 接收一个返回 Promise 的回调函数
 * @returns Resource实力对象，包含异步操作的预加载及数据读取
 */
export function createSuspenseResource<T>(load: () => Promise<T>): Resource {
  // 缓存变量
  const result: {
    state: StateType;
    value: any;
  } = {
    state: STATE.INITIAL,
    value: null,
  };

  function init() {
    if (result.state !== STATE.INITIAL) {
      return;
    }
    result.state = STATE.PENDING;
    const p = (result.value = load());
    p.then(
      (res) => {
        if (result.state === STATE.PENDING) {
          result.state = STATE.RESOLVED;
          result.value = res;
        }
      },
      (err) => {
        if (result.state === STATE.PENDING) {
          result.state = STATE.REJECTED;
          result.value = err;
        }
      }
    );
    return p;
  }

  return {
    read() {
      switch (result.state) {
        case STATE.INITIAL:
          throw init();
        case STATE.PENDING:
          throw result.value;
        case STATE.RESOLVED:
          return result.value;
        case STATE.REJECTED:
          throw result.value;
      }
    },
    preload() {
      init();
    },
  };
}
