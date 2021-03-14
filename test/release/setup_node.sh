#!/bin/sh

install() {
    echo "$PWD> . ~/.nvs/nvs.sh add $NODE && nvs use $NODE"
    (. ~/.nvs/nvs.sh add $NODE && nvs use $NODE) &
    PID=$!
    (sleep 60; pkill -P $PID; kill $PID &> /dev/null) &
    WID=$!
    wait $PID &> /dev/null
    CODE=$?
    kill $WID &> /dev/null
    echo RETURNED $CODE
    return $CODE
}

git clone --branch v1.6.0 --depth 1 https://github.com/jasongin/nvs.git ~/.nvs
while ! install; do
    cd ~/.nvs
    while !(git clean -xdf); do echo "'git clean' failed - retrying..."; done
    cd -
done
