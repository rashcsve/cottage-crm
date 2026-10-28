import appDynamic from "next/dist/api/app-dynamic";
import type { DynamicOptions, Loader } from "next/dist/api/app-dynamic";
import { vi } from "vitest";

export const dynamicLoads = createDynamicLoads();

function createDynamicLoads() {
  let release = () => {};
  let gate = Promise.resolve();

  return {
    loader: vi.fn(),
    get gate() {
      return gate;
    },
    hold() {
      gate = new Promise<void>((resolve) => {
        release = resolve;
      });
    },
    release() {
      release();
    },
    fail(error: Error) {
      gate = Promise.reject(error);
      gate.catch(() => {});
    },
  };
}

export function createSpiedDynamic() {
  function spiedDynamic<P>(loader: Loader<P>, options?: DynamicOptions<P>) {
    return appDynamic<P>(() => {
      dynamicLoads.loader();

      return dynamicLoads.gate.then(() =>
        typeof loader === "function" ? loader() : loader,
      );
    }, options);
  }

  return { default: spiedDynamic };
}
