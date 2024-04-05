#!/usr/bin/env sh
#
# Copyright (c) Microsoft Corporation. All rights reserved.
#
ROOT="$(dirname "$(dirname "$(dirname "$(readlink -f "$0")")")")"

APP_NAME="code-oss"
VERSION="1.87.0"
COMMIT="7215958b3c57945b49d3b70afdba7fb47319ca85"
EXEC_NAME="code-oss"
CLI_SCRIPT="$ROOT/out/server-cli.js"
"$ROOT/node" "$CLI_SCRIPT" "$APP_NAME" "$VERSION" "$COMMIT" "$EXEC_NAME" "--openExternal" "$@"
