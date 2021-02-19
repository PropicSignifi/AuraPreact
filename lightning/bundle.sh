#!/bin/bash
op=$1

function usage {
    echo "Usage: bundle.sh init bundleName | bundle.sh clone fromBundleName toBundleName"
}

function init {
    bundleName=$1

    mkdir -p ./src/aura/$1

    cp ./src/tools/template/template.cmp ./src/aura/$1/$1.cmp
    cp ./src/tools/template/template.cmp-meta.xml ./src/aura/$1/$1.cmp-meta.xml
    cp ./src/tools/template/template.css ./src/aura/$1/$1.css
    cp ./src/tools/template/templateController.js ./src/aura/$1/${1}Controller.js
    cp ./src/tools/template/templateHelper.js ./src/aura/$1/${1}Helper.js
    cp ./src/tools/template/templateRenderer.js ./src/aura/$1/${1}Renderer.js

    echo "Bundle initiated successfully."
}

function clone {
    fromBundleName=$1
    toBundleName=$2

    if [[ ! -d ./src/aura/$1 ]];then
        echo "Invalid fromBundleName"
        exit 1
    fi

    mkdir -p ./src/aura/$2

    if [[ -f ./src/aura/$1/${1}.cmp ]];then
        cp ./src/aura/$1/${1}.cmp ./src/aura/$2/${2}.cmp
    fi
    if [[ -f ./src/aura/$1/${1}.cmp-meta.xml ]];then
        cp ./src/aura/$1/${1}.cmp-meta.xml ./src/aura/$2/${2}.cmp-meta.xml
    fi
    if [[ -f ./src/aura/$1/${1}.app ]];then
        cp ./src/aura/$1/${1}.app ./src/aura/$2/${2}.app
    fi
    if [[ -f ./src/aura/$1/${1}.app-meta.xml ]];then
        cp ./src/aura/$1/${1}.app-meta.xml ./src/aura/$2/${2}.app-meta.xml
    fi
    if [[ -f ./src/aura/$1/${1}.evt ]];then
        cp ./src/aura/$1/${1}.evt ./src/aura/$2/${2}.evt
    fi
    if [[ -f ./src/aura/$1/${1}.evt-meta.xml ]];then
        cp ./src/aura/$1/${1}.evt-meta.xml ./src/aura/$2/${2}.evt-meta.xml
    fi
    if [[ -f ./src/aura/$1/${1}.intf ]];then
        cp ./src/aura/$1/${1}.intf ./src/aura/$2/${2}.intf
    fi
    if [[ -f ./src/aura/$1/${1}.intf-meta.xml ]];then
        cp ./src/aura/$1/${1}.intf-meta.xml ./src/aura/$2/${2}.intf-meta.xml
    fi
    if [[ -f ./src/aura/$1/${1}.css ]];then
        cp ./src/aura/$1/${1}.css ./src/aura/$2/${2}.css
    fi
    if [[ -f ./src/aura/$1/${1}.design ]];then
        cp ./src/aura/$1/${1}.design ./src/aura/$2/${2}.design
    fi
    if [[ -f ./src/aura/$1/${1}.svg ]];then
        cp ./src/aura/$1/${1}.svg ./src/aura/$2/${2}.svg
    fi
    if [[ -f ./src/aura/$1/${1}Controller.js ]];then
        cp ./src/aura/$1/${1}Controller.js ./src/aura/$2/${2}Controller.js
    fi
    if [[ -f ./src/aura/$1/${1}Helper.js ]];then
        cp ./src/aura/$1/${1}Helper.js ./src/aura/$2/${2}Helper.js
    fi
    if [[ -f ./src/aura/$1/${1}Renderer.js ]];then
        cp ./src/aura/$1/${1}Renderer.js ./src/aura/$2/${2}Renderer.js
    fi

    echo "Bundle cloned successfully."
}

if [[ "$op" == "" ]];then
    usage
    exit 1
fi

case $op in
    "init")
        init $2
        ;;
    "clone")
        clone $2 $3
        ;;
    *)
        usage
        ;;
esac
