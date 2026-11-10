import { defineConfig } from 'vitest/config';
import path from 'path';
export default defineConfig({test:{include:['tests/approvals/**/*.test.ts'],fileParallelism:false},resolve:{alias:{'@':path.resolve(__dirname,'../../src')}}});
