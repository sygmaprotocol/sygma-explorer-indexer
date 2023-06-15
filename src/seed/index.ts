import { seeder } from "./seeder"

const main = async (): Promise<void> => {
  await seeder()
}

void main()
