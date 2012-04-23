#!/bin/sh
rm *.wav *.ogg
for i in orig/*
do
    sox -v 0.5 $i $(basename $i)
    oggenc -Q $(basename $i)
done
