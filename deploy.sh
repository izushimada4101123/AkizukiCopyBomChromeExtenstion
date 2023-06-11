#!/bin/bash

filename=AkizukiBom.zip

rm ${filename}

cd src
zip -r ../${filename} .
cd --
