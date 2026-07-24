---
title: "Reflections on Introducing Agile and Continuous Integration (CI) into Embedded Software Development"
slug: "2024-07-27-Embedded-Software-Development-with-Scrum-and-CI"
description: "Based on my takeaways from reading 'Continuous Delivery 2.0' and insights gained from discussions with clients, this article outlines several approaches to applying software engineering concepts like Agile and Continuous Integration (CI) to the embedded software domain."
date: 2024-07-27T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Software Engineering"]
tags: ["Embedded","Software Engineering"]
draft: false
---


My primary work is in embedded software development in the consumer electronics sector. In the realm of software engineering, I have encountered concepts like Agile and DevOps extensively and have read several books to build a systematic understanding of them. However, I always believed that these concepts were better suited for pure software fields—especially web, mobile apps, and PC software—where updating and deploying new versions is straightforward. For embedded software and electronic products:

- Software development requirements are constrained by early-stage hardware planning and costs (especially in consumer electronics, where hardware specifications cannot significantly exceed current needs in order to minimize costs). Product requirements and hardware specs must be thoroughly defined at the project's inception. Otherwise, discovering late in the project that the hardware cannot meet new requirements leads to catastrophic consequences.
- OTA (Over-the-Air) updates are often not as convenient or secure, limited by network connectivity and the completeness of the software implementation.

Therefore, for embedded software, sticking to a disciplined Waterfall development management model seemed to be the gold standard: strictly defining requirements from the very beginning, determining hardware specs and software designs based on those requirements, then proceeding to development, testing, and final delivery, while making every effort to avoid requirement changes throughout the process.


Recently, I read a book titled *Continuous Delivery 2.0: Business-Driven DevOps Essentials* (《持续交付2.0：业务引领的DevOps精要》) and discussed the implementation of Agile and CI in other embedded products with a major client. This experience challenged my previous assumptions. While fully adopting all Agile and continuous integration/deployment practices in embedded software is unrealistic due to the constraints of hardware and embedded environments, adopting certain aspects—especially frequent code commits, continuous integration, and automated testing—can still significantly boost team efficiency in the embedded software domain.


## Issues with the Waterfall Model and How Agile/CI Solves Them


When applied to hardware products and embedded development, the primary issues with the Waterfall development management model are:

- It cannot effectively address the software complexity and uncertainty inherent in large-scale projects, particularly in environments with complex and rapidly changing requirements. Frequently changing requirements are an absolute disaster for Waterfall planning.
- In the Waterfall workflow, integration testing occurs late in the project after software modules are fully designed and developed. Not only does late-stage module integration and debugging require massive effort and time, but the team and users also only get to see the overall system operation at the very end of the project to verify if it aligns with the initial design. If discrepancies between actual implementation and early expectations are found late, or if major framework issues arise, the cost to fix them skyrockets exponentially (especially if hardware-related). Consequently, managing schedule and cost risks becomes extremely difficult.

To address these Waterfall limitations, Agile methodologies break down requirements into granular, prioritized user stories. Working in 2-4 week iterations, the team develops only a subset of requirements per cycle, but delivers a runnable, quality-assured software build at the end of each iteration (though it only contains a portion of the overall features). During the iteration, automated builds and testing are used to speed up development and eliminate waste. At the end of each iteration, retrospective meetings evaluate successes and failures to guide continuous improvement, and the next set of requirements is selected from the backlog for the upcoming iteration. With this approach, a runnable version is always available from the early stages of the project to validate initial concepts. This drastically reduces integration pressure and workload in the final stages, allowing issues to be exposed early in the lifecycle when they are much cheaper to resolve.


## Git and the CI Environment


Frankly, as simple code management tools for team collaboration, both SVN and Git perform exceptionally well. However, when it comes to branch management, code review, and integration with various CI/CD toolchains, Git is clearly superior, offering far more resources and solutions.


After more than a decade of evolution, the industry now has many mature CI/CD platforms that easily satisfy the integration and development needs of small-to-medium-sized companies and their projects. Notable examples include GitLab, Jenkins, and GoCD (which the author of *Continuous Delivery 2.0* helped develop).


Reference [2] provides a highly detailed guide on creating CI tasks using GitLab CI/CD modules. The process essentially triggers serialized and parallel tasks via scripts when code is pushed to the Git repository, completing automated builds, tests, and deployments. There is nothing uniquely distinct about continuous integration for embedded software here; you simply call different scripts to execute their respective tasks within a Linux environment according to the workflow.


![Untitled.png](/images/blog/对嵌入式软件开发中导入敏捷和持续集成CI的思考-1.png)


## Requirement Splitting


To support Agile or CI development, requirements must be split into sufficiently small and independent pieces. This ensures that developers can work in parallel and successfully complete the entire development-to-testing cycle within a single iteration. To achieve this, the author highlights the INVEST criteria for story splitting:

- **Independence**: Split requirements are independent of one another.
- **Negotiable**: Requirements are negotiable between product owners and developers.
- **Valuable**: The requirement delivers clear value, with high-value items prioritized in the current phase.
- **Estimable**: The effort and cost of the requirement can be estimated and completed within the current iteration.
- **Small**: The scope of the requirement is small and manageable, ensuring the development and bug-fixing cycle fits within the iteration timeframe.
- **Testable**: The requirement can be tested independently once developed.

The final split requirements are what we refer to as User Stories.


During each Agile iteration, the most valuable User Stories are selected from the backlog and scheduled for completion within the current iteration cycle, based on estimates of workload and the time required for development, testing, and validation.


## Automated Unit and Module Testing


For embedded software development, the biggest hurdle in adopting Agile and CI principles is implementing automated testing. After all, both Agile and CI rely on frequent code commits and frequent builds to expose bugs as early as possible. Without automated testing tools and pipelines, relying solely on manual testing for such frequent releases is clearly unrealistic. Therefore, a robust automated testing workflow is indispensable to make Agile and CI genuinely effective in embedded development.


However, running automated tests reliably and effectively across various embedded hardware specifications is highly challenging. It is deeply coupled with product requirements, hardware limitations, and the target embedded operating system. Consequently, the best results often come from custom-tailored solutions built for the specific project. Fortunately, for the C and C++ languages commonly used in embedded development, mature unit testing frameworks like CppUnit are readily available.


During development, developers must write corresponding test cases based on the automated testing framework so they can be executed within the CI pipeline. It is crucial to ensure that test code is not treated as a "second-class citizen"; to maintain the rigor and completeness of the testing process, continuous attention must be paid to the quality of the test code implementation.


## Code Review and Submission


For project teams with frequent turnover, ensuring the built-in quality of code submitted by each developer is a critical challenge for maintaining and continuously improving software maintainability. Without strict guidelines and gates, letting developers submit code using their own idiosyncratic styles and approaches will inevitably degrade code maintainability.


To address this, teams must establish clear coding standards. Besides requiring developers to adhere to these standards during implementation, incorporating Code Reviews to gate code submission quality is an indispensable step.


In traditional Waterfall models, code from various modules is often merged into the main branch only after development is complete. This bulk merging creates a massive Code Review workload, making it very difficult to conduct reviews effectively. Furthermore, since there are usually many bugs to fix post-integration, Code Reviews—which offer less immediate gratification—are often deprioritized. Over time, the process loses its value in ensuring built-in quality and degenerates into a mere bureaucratic checkbox.


In a CI-driven workflow, by breaking down requirements into small chunks, each developer's submission to the main branch is limited to 2-3 days' worth of work. This keeps the Code Review workload manageable and allows the process to run smoothly.


Therefore, alongside a CI development workflow, teams should limit the scope of individual requirements and submission sizes, ensuring that all code must pass a code review before being merged into the main branch.


## Complete Development Workflow

- **Requirement Sources**: Outstanding backlog items, new customer-requested features, and bugs reported by QA.
- **Design and Review**: Technical leads or architects organize developers to discuss and define technical solutions for requirements, provide design documents, and align on implementation details internally.
- **Development**: Developers implement features or fix bugs on their feature branches according to the design documents, and perform local testing to ensure functionality.
- **Pre-commit Checks**: Prior to submitting code, developers run automated scripts for static/dynamic analysis, code style linter, and smoke tests, resolving any issues surfaced during scanning.
- **Pull Request**: Developers submit a Git Pull Request (PR) to merge their changes into the main branch.
- **Code Review**: Technical leads conduct code reviews to ensure compliance with coding standards and alignment with the design, then approve the merge to the main branch.
- **Continuous Integration**: Once new code is merged, the CI server automatically triggers the integration pipeline. The CI environment sets up the build environment, pulls the fresh code, performs static analysis, runs the automated build, and executes unit, module, and integration test cases. If all checks pass, the compiled image is uploaded to the release server.
- **Testing and Release**: QA engineers fetch the new build from the release server to begin manual testing and schedule automated performance and stress tests. Once all tests pass, the official version is released.

In summary, for software running on hardware products—namely embedded software—the "CI" part of the CI/CD pipeline is completely viable. The entire process of requirement splitting, code submission, and automated building is no different from other software domains, except for a few areas requiring extra attention:

- **Requirements**: Hardware specifications impose very strict constraints on how requirements can evolve once the hardware is finalized. Unlike web development, where scaling can be easily handled by adding servers or bandwidth in a cloud environment, these constraints are rigid.
- **Automated Testing**: Deciding which components can be tested locally (e.g., pure logic) and which must run on target hardware to yield accurate, reliable results.

However, "CD" (Continuous Delivery/Deployment) is naturally less applicable. It is practically impossible—and highly risky—to automatically deploy CI-verified images directly to OTA servers. Fortunately, most electronic products do not require frequent embedded software updates anyway; overly frequent updates can even ruin the user experience. Thus, the absence of CD is rarely a major pain point for the embedded development workflow.


## References

- *Continuous Delivery 2.0: Business-Driven DevOps Essentials*
- [GitLab CI/CD - Feiwu Dashixiong - cnblogs.com](https://www.cnblogs.com/cjsblog/p/12256843.html)