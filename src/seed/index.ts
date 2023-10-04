/*
The Licensed Work is (c) 2023 Sygma
SPDX-License-Identifier: LGPL-3.0-only
*/
import { seeder } from "./seeder"

const main = async (): Promise<void> => {
  await seeder()
}

void main()
