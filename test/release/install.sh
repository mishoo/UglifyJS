echo "::group::GitHub Environment Variables"
echo "CI: $CI"
echo "GITHUB_WORKFLOW: $GITHUB_WORKFLOW"
echo "GITHUB_RUN_ID: $GITHUB_RUN_ID"
echo "GITHUB_RUN_NUMBER: $GITHUB_RUN_NUMBER"
echo "GITHUB_ACTION: $GITHUB_ACTION"
echo "GITHUB_ACTIONS: $GITHUB_ACTIONS"
echo "GITHUB_ACTOR: $GITHUB_ACTOR"
echo "GITHUB_REPOSITORY: $GITHUB_REPOSITORY"
echo "GITHUB_EVENT_NAME: $GITHUB_EVENT_NAME"
echo "GITHUB_EVENT_PATH: $GITHUB_EVENT_PATH"
echo "GITHUB_WORKSPACE: $GITHUB_WORKSPACE"
echo "GITHUB_SHA: $GITHUB_SHA"
echo "GITHUB_REF: $GITHUB_REF"
echo "GITHUB_HEAD_REF: $GITHUB_HEAD_REF"
echo "GITHUB_BASE_REF: $GITHUB_BASE_REF"
echo "GITHUB_SERVER_URL: $GITHUB_SERVER_URL"
echo "GITHUB_API_URL: $GITHUB_API_URL"
echo "GITHUB_GRAPHQL_URL: $GITHUB_GRAPHQL_URL"
echo "::endgroup::"

if command -v timeout &> /dev/null; then NATIVE=1; fi
timeout() {
    T=$1
    shift
    shift
    shift
    expect <<EOF
set timeout $T
spawn -noecho sh -c "$@"
expect timeout { exit 124 } eof
catch wait ret
exit [lindex \$ret 3]
EOF
    return $?
}
if [ $NATIVE ]; then unset -f timeout; fi

while !(git clone --branch v1.6.2 --depth 1 https://github.com/jasongin/nvs.git ~/.nvs); do
    rm -rf ~/.nvs
done
while ! timeout 60 bash -c ". ~/.nvs/nvs.sh add $NODE && nvs use $NODE"; do
    cd ~/.nvs
    while !(git clean -xdf); do echo "'git clean' failed - retrying..."; done
    cd -
done
. ~/.nvs/nvs.sh --version
nvs use $NODE
node --version
npm config set audit false
npm config set fund false
npm config set loglevel error
npm config set optional false
npm config set save false
npm config set strict-ssl false
npm config set update-notifier false
npm --version
while !(npm install); do
    while !(npm cache clean --force); do echo "'npm cache clean' failed - retrying..."; done
done
