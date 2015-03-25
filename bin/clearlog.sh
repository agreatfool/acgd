#!/bin/bash

LOGDIR=../log

if [ -d ${LOGDIR} ]; then
    for logfile in $(find ${LOGDIR} -name \*.log); do
        rm "$logfile"
    done
fi