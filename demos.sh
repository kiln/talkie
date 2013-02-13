#!/bin/bash

for d in demos/*
do
    f=${d#demos/}
    n=${f%.*}
    
    bin/mkdemo examples/$f.html > $d/index.html
    if [ -d examples/media/$n ]
    then
        cp examples/media/$n/* $d
    fi
done
