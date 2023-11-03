inline_script_off: {
    beautify = {
        inline_script: false,
    }
    input: {
        console.log("</sCrIpT>");
    }
    expect_exact: 'console.log("</sCrIpT>");'
    expect_stdout: "</sCrIpT>"
}

inline_script_on: {
    beautify = {
        inline_script: true,
    }
    input: {
        console.log("</sCrIpT>");
    }
    expect_exact: 'console.log("<\\/sCrIpT>");'
    expect_stdout: "</sCrIpT>"
}
