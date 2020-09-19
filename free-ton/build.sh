#!/bin/bash

rm build/*

cd contracts

solc -o ../build Registry.sol

tvm_linker compile \
  --lib /usr/local/bin/stdlib_sol.tvm \
  --abi-json ../build/TONBox.abi.json \
  -o ../build/TONBox.tvm \
  ../build/TONBox.code

tvm_linker compile \
  --lib /usr/local/bin/stdlib_sol.tvm \
  --abi-json ../build/Registry.abi.json \
  -o ../build/Registry.tvm \
  ../build/Registry.code
