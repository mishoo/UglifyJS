---
name: Bug report
about: Create a report to help us improve
title: ''
labels: ''
assignees: ''

---

<!-- Note: sub-optimal but correct code is not a bug -->

**Uglify version (`uglifyjs -V`)**

**JavaScript input**

<!--
A complete parsable JS program exhibiting the issue with UglifyJS alone
- without third party tools or libraries.

Ideally the input should be as small as possible, but may be large if isolating
the problem proves to be difficult. The most important thing is that the
standalone program reliably exhibits the bug when minified. Provide a link to a
gist if necessary.

Solely providing minified output without the original uglify JS input is not
useful in determining the cause of the problem. Issues without a reproducible
test case will be closed.
-->

**The `uglifyjs` CLI command executed or `minify()` options used.**

<!--
Command-line or API call to UglifyJS without third party tools or libraries.

For users using bundlers or transpilers, you may be able to gather the required
information through setting the `UGLIFY_BUG_REPORT` environment variable:

    export UGLIFY_BUG_REPORT=1      (bash)
    set UGLIFY_BUG_REPORT=1         (Command Prompt)
    $Env:UGLIFY_BUG_REPORT=1        (PowerShell)

before running your usual build process. The resulting "minified" output should
contain the necessary details for this report.
-->

**JavaScript output or error produced.**

<!--
Only minified code that produces different output (or error) from the original
upon execution would be considered a bug.
-->
