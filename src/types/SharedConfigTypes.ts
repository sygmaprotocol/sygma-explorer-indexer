/**
 * The Licensed Work is (c) 2023 Sygma
 * SPDX-License-Identifier: LGPL-3.0-only
 */

import { BaseConfig } from "@buildwithsygma/core"
export interface SharedConfig extends BaseConfig<"ethereum" | "substrate"> {
  rpcUrl: string
}

export type ConfigError = {
  error: { type: "config" | "shared-config"; message: string; name?: string }
}
