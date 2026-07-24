---
title: "Software Bill of Materials (SBOM) and Its Standard Formats"
slug: "2024-SBOM-and-its-standard-format"
description: "This article summarizes the concept, origin, main functions, and current mainstream SBOM file formats, and provides information on the automated generation of SBOMs."
date: 2024-09-24T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["Software Engineering"]
tags: ["Software Engineering"]
draft: false
---

## Concept and Origin of SBOM

SBOM stands for Software Bill of Materials.

In modern software development of any moderate scale, writing all software components from scratch is no longer practical, as it would be far too inefficient and slow. Consequently, software development widely relies on open-source software, third-party software libraries, and framework libraries from various sources. Effectively managing these diverse software components within a software system, and having a clear understanding of security vulnerabilities, licenses, authorization management, and version information associated with all software components, is crucial for the sustainable development and maintenance of software. The SBOM emerged to address this need.

- On March 12, 2024, the European Union officially approved the Cyber Resilience Act, requiring all digital products exported to Europe to provide information such as SBOMs, making the SBOM a passport for international trade in the software sector.

The primary function of an SBOM is to clearly record information regarding the origins of various components within a software system and their dependency relationships, effectively enhancing the transparency of software composition and software supply chain management. The software components referred to here are mainly open-source software and third-party software included in and depended upon by the software system. Utilizing SBOM management provides a clear understanding and continuous management of the security and traceability of these software components.

The concept of SBOM was first proposed by the United States in 2014. In 2021, the National Telecommunications and Information Administration (NTIA) released SBOM specifications, defining an SBOM as a formal, machine-readable inventory of software components and their hierarchical dependency relationships, detailing the information and structural relationships of these components.

As the name suggests, SBOM clearly evolved from the BOM (Bill of Materials) concept in hardware manufacturing. The difference is that a BOM in hardware manufacturing describes the various components, structural relationships, and quantities required during the production of a hardware product, whereas a software SBOM describes the inventory of software components contained within a software system and their mutual dependencies.

Similar to a BOM in hardware, an SBOM is essentially a data file that should contain at least: supplier name, component name, component version, dependencies between components, SBOM author name, unique identifier, and timestamp. Furthermore, as defined by the NTIA, the format and content of an SBOM file must be both machine-readable and human-readable.

- Because it is machine-readable, integration with security vulnerability management systems for scanning and analysis allows SBOMs to easily identify and enhance the analysis and response capabilities for cybersecurity incidents in software systems.

## Standardized Data Formats for SBOM: SPDX / CycloneDX / SWID

Since SBOM information needs to support both machine and human readability to facilitate automated generation and sharing between organizations, defining standardized SBOM data file formats is essential. Therefore, the NTIA released "The Minimum Elements for a Software Bill of Materials (SBOM)" in 2021, which defined three standard SBOM file formats: SPDX, CycloneDX, and SWID.

### SPDX

SPDX stands for Software Package Data Exchange. SPDX itself is an open-source project of the Linux Foundation and became an internationally recognized SBOM standard in August 2021.

SPDX is a heavy-weight SBOM format. Its standout feature is its robust support for displaying detailed software component license information. It is suitable for software supplier management in large, complex organizations and has therefore been widely adopted by leading international enterprises in the software industry.

The official SPDX website is: www.spdx.org

### CycloneDX

The CycloneDX format (also known as the CDX format) was created by the OWASP (Open Worldwide Application Security Project) community. It is a lightweight SBOM standard format focused on cybersecurity risk management and supply chain component analysis. It is better suited for vulnerability management, security audits, and similar use cases, and is thus frequently used by small-to-medium teams and organizations heavily reliant on open-source software.

CycloneDX supports XML and JSON output formats.

### SWID

SWID was created directly by the National Institute of Standards and Technology (NIST) and became an international standard in 2015. SWID uses a standardized XML format for description, defining four tags to identify and describe different states and information throughout the software development lifecycle.

> In summary, whether in SPDX, CycloneDX, or SWID format, an SBOM file is essentially a JSON- or XML-like file that defines a detailed list of third-party or other open-source software components included in a software system, along with their mutual dependencies.

For example, the figure below illustrates the general structure of a generated SBOM file:

![image.png](/images/blog/软件物料清单SBOM及其标准格式-1.png)

## Generating an SBOM

Ideally, generating an SBOM for a software project involves tools that, when invoked, scan the entire software project's configuration and source code directory to automatically produce all included software components, version information, and their mutual dependencies. Since SBOM standards are open, as long as the scanning process can be automated, the entire workflow of generating SBOM files can also be automated. If the SBOM for a large software system had to be manually generated and maintained, the workload would be immense, highly prone to omissions, and error-prone.

Consequently, there are now many mature commercial and open-source solutions available for SBOM generation. For instance, `opensca` referenced in the second document can scan a software project with a single command and generate SBOM files in various formats:

```javascript
opensca-cli -path ${project_path} -out output.dsdx
```

These SBOM generation solutions can even be embedded into CI/CD pipelines, ensuring that every subsequent code commit or build process re-scans the code and generates an updated version of the SBOM, keeping it synchronized with the latest codebase. This significantly improves the efficiency of software development and SBOM maintenance.

However, whether open-source or commercial, these automated SBOM generation tools are primarily targeted at languages like Java, Python, JavaScript, and Go. After extensive searching, I have consistently failed to find an automated SBOM generation solution specifically for C/C++, which is widely used in embedded systems.

The reason is that these SBOM generation tools rely on project package management systems during the directory structure and code scanning process—such as Maven for Java, PiP for Python, and npm for JavaScript. Therefore, the SBOM generation process essentially scans the configurations of these package managers to extract the dependent software packages' SBOM information and formats it into a compliant SBOM document structure.

In contrast, the C/C++ domain widely used in embedded systems lacks a de facto package management standard. Third-party software libraries depended upon by projects are often scattered across different locations in the project structure based on the developer's architectural design. Consequently, it is difficult to accurately compile all third-party software libraries depended on by the software system through automated scanning.

Therefore, **in the absence of a mature package management system (and without SBOM scanning and generation tools that support it), generating an SBOM for C/C++ software projects must rely on developers manually organizing and filling out spreadsheets. This is inefficient, and effective solutions remain scarce in the short term.**

Currently, a relatively popular package management system for C/C++ is Conan. If Conan is used to manage C/C++ third-party packages in a project, its extension ([https://github.com/conan-io/conan-extensions](https://github.com/conan-io/conan-extensions)) can be used to generate an SBOM. Additionally, Trivy ([Overview - Trivy (aquasecurity.github.io)](https://aquasecurity.github.io/trivy/v0.47/docs/coverage/language/)) supports SBOM generation for the Conan package manager:

![1728610040543.png](/images/blog/软件物料清单SBOM及其标准格式-2.png)

Another open-source SBOM generation software, Syft, also supports the combination of C/C++ and Conan:

![1728610108189.png](/images/blog/软件物料清单SBOM及其标准格式-3.png)

However, the prerequisite in all these cases is that Conan must be used to manage the project's third-party software packages from the very beginning of project planning.

## References

- "International Experience and Independent Pathways in Building Software Bill of Materials Systems" by Pan Yan, Chengweichen, and Li Yujia
- [Technical Sharing | Horizontal Evaluation of Different Format Standard SBOM Inventories: SPDX, CDX, and DSDX - Tencent Cloud Developer Community - Tencent Cloud (tencent.com)](https://cloud.tencent.com/developer/article/2366773)
- [Top Tools For Automating SBOMs (mend.io)](https://www.mend.io/blog/top-tools-for-automating-sboms/#sbom-tools-for-c/c++)
- [C++ Package Manager - Conan | Shixizhi (guorongfei.com)](https://blog.guorongfei.com/2018/04/23/conan-tutorial/)