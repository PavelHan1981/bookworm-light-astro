---
title: "Standard Workflow for Team Development Using SVN"
slug: "2022-07-12-svn-standard-workflow"
description: "Based on reflections on the code management workflows of development teams in my work and a study of relevant online resources, this article provides a complete and re-summarized workflow for using SVN for unified code management in a team."
date: 2022-07-12T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Software Engineering"]
tags: ["Software Engineering", "SVN"]
draft: false
---

In fact, Subversion (SVN) has its own standard workflow design for software development in team environments.

In a software project that uses SVN for project version standards, the project's SVN repository directory should contain at least the following three directories:

- **Trunk**: The mainline branch for code. All code will be merged and processed on this branch.
- **Branch**: Development and debugging branches. All developers, whether fixing bugs or developing new features, create their own development and debugging branches here, which are then merged into the Trunk.
- **Tag**: Official release version branches. Versions released externally after passing tests. A tag is created in this branch to mark and back up the version.

From the usage logic of each branch:

- Direct development and commits should not be performed on the Trunk. Operations on the Trunk branch should be strictly limited to:
    - Creating new development branches using the `svn copy` command;
    - Merging modifications from development branches into the Trunk branch using the `svn merge` command;
    - Creating backups of official release versions under the `tag` subdirectory using the `svn copy` command;
- Regarding the use of **Branch**: For all developers—whether fixing bugs in the Trunk code or developing new features—the basic workflow is to create a personal development branch based on a specific revision of the Trunk, and then perform development and debugging on that branch. Once development and debugging are complete, the changes are merged back into the Trunk branch.
    - For branch usage, you should only use `svn copy` to create a new development branch under the `branch` subdirectory. Subsequent commits during the debugging phase should all be made within this development branch. Once debugging and testing are complete, use the `svn merge` command to merge the code into the trunk.
- Regarding the use of **Tag**: The `tag` subdirectory is used exclusively to store official release versions that have passed testing, facilitating quick retrospective analysis later. Since the tag branch is only used to back up official releases, the code stored here should not be modified. The only operation performed on this branch is copying the tested official version from the trunk branch using the `svn tag` (or `svn copy`) command.
    - For tag usage, you should only use the `svn copy` command to back up the released official version code from the trunk branch.

**Note: Whether you use the `svn copy` command to create a new development branch or the `svn tag` command to tag an official release, the underlying action performed is actually a copy operation from a specific revision on the trunk—copying the code from the trunk subdirectory to the branch or tag subdirectory.**

### Why not develop, debug, and commit directly on the Trunk to avoid needing Branches?

In a single-person project, there is indeed no need to use a branch. All development and debugging can simply be committed and maintained on the trunk.

The addition of branches is primarily intended to solve the problems of multi-person collaborative development. If all developers commit code to the same trunk, a large volume of unstable, unfinished intermediate code uploaded concurrently to the same trunk branch will inevitably cause numerous conflicts. This makes the trunk branch unstable, and developers are forced to waste a lot of energy repeatedly resolving intermediate version conflicts.

- If everyone temporarily holds off on committing code until a debugging/development sub-task is incomplete, and waits until the issue is resolved and tested before committing, can this problem be solved? This does prevent mutual conflicts between intermediate versions, but the catch is that debugging code in an intermediate state can only be stored locally on the developer's computer, carrying a constant risk of code loss. One of the very important purposes of introducing a software version control system is to be able to back up everyone's code on a server—even code in an active development state—thus preventing loss for any reason.

Therefore, overall, introducing branches to collaboratively manage multi-person development is the most appropriate workflow:

- Everyone commits code to their own debugging and development branch. Because only you are uploading code to your own development branch, you avoid commit conflicts with others' intermediate-state versions and the resulting unnecessary stability issues. Once your debugging work is complete, you merge it uniformly into the trunk. This prevents mutual conflicts among intermediate debugging states, while still providing a place to back up intermediate code at any time. As long as developers commit their code regularly, they don't have to worry about code loss caused by issues with their development machines or environments.
- Meanwhile, the trunk branch is used exclusively to receive merges of fully debugged and developed code, ensuring the stability of the code on the trunk as much as possible.

## Developer Workflow

- Upon receiving a task to fix a bug or add a new feature, first use the `svn copy` command from the Trunk's HEAD or a specific revision to create a new development/debugging branch under the `branch` subdirectory;
- From then on, all intermediate code for debugging and development work is committed within this development/debugging branch;
- Once development, debugging, and self-testing are complete, use the `svn merge` command to merge the changes into the trunk, resolve any merge conflicts, and verify the correctness of the merged functionality;
- For an official integrated version, once all developers have merged their development/debugging branch code into the trunk and completed self-testing, the instruction for integrated version testing is issued;

### Workflow of the `svn merge` Command

Using the SVN command line to perform merge operations can be somewhat difficult to understand. A reference document [Reference Link](http://blog.darkmi.com/2015/08/11/3823.html) provides a very clear explanation.

Basic syntax of the `svn merge` command: `svn merge sourceURL1[@N] sourceURL2[@M] [WCPATH]`

- Note: Before performing an `svn merge`, you must first check out a clean, current copy of the trunk, and enter that trunk directory to execute the `svn merge` command.
- `sourceURL1[@N]`: The `sourceURL` represents the URL of the branch to be merged into the trunk, and `N` is the revision number when this branch was initially created from the trunk.
- `sourceURL2[@M]`: The `sourceURL` represents the URL of the branch to be merged into the trunk, and `M` is the revision number up to which the branch needs to be merged. If it's the branch's latest revision, `@M` can be omitted.
- `WCPATH`: Specifies the local directory where the differences between the two versions specified by the above parameters should be merged. If merging into the current directory, simply use `.` to represent it.

Therefore, the execution logic of the above command is: find the diff file representing the differences between the two revisions `N` and `M` on the development branch `sourceURL1`, and then merge the contents of this diff file into the local directory specified by `WCPATH`.

Using the example provided in the [reference document](http://blog.darkmi.com/2015/08/11/3823.html):

- `svn merge proj/branches/proj_branch_1@101 proj/branches/proj_branch_1 .`

The above command means: find the differences between revision 101 and the latest revision of the branch `proj/branches/proj_branch_1`, and merge these differences into the trunk code located in the current directory.

It is important to note that the merged code is only saved locally at the `WCPATH` path. You must run `svn commit` within this path to upload the merged code to the trunk so that the merge is actually applied to the server's trunk branch.

How do you find the version revision number when a branch was created?

- `svn log –stop-on-copy [branch url]`

Example of primary commands used:

```c
svn copy svn://xx.com/repo/trunk svn://xx.com/branch/pavelhan/bugfix-xxx -m “create bugfix-xxx branch”
svn checkout svn://xx.com/branch/pavelhan/bugfix-xxx
svn commit -m "change some code"

//checkout current trunk and cd trunk
svn merge svn://xx.com/branch/pavelhan/bugfix-xxx@N svn://xx.com/branch/pavelhan/bugfix-xxx .
svn commit -m "merge bugfix-xxx branch to trunk code"
```

## Tester Workflow

Version releases include integrated version releases and official version releases, where:

- **Integrated version release**: Initiated by developers and tested by testers. Once developers complete the defined features and bug list for an integrated version and finish self-testing, they issue the integrated version testing instruction on the trunk. Upon receiving this instruction, testers download the code from the specified trunk revision, compile it, and begin testing;
- **Official version release**: Once integrated version testing is complete, decisions are made based on test results as to whether to issue an official release version. The official release version is then backed up in the `tag` subdirectory using the `svn tag` (or `svn copy`) command.

Example of primary commands used:

```c
svn checkout svn://xx.com/repo/trunk
svn copy svn://xx.com/repo/trunk svn://xx.com/repo/tags/V1.0 -m "V1.0 release version"
```

## Reference Documents

- [svn merge command usage | darkmi's blog](http://blog.darkmi.com/2015/08/11/3823.html)
- [[svn] Linux commands - SVN branch creation and merging - ZouKankan](http://t.zoukankan.com/jiangzhaowei-p-5560394.html)
- [Usage of SVN trunk, branch, and tag - Baidu Wenku](https://wenku.baidu.com/view/57580790b3717fd5360cba1aa8114431b90d8e86.html)