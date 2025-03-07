<p align="center">
  <img src="https://res.cloudinary.com/dpfpk49oa/image/upload/v1712719273/mxrw7jnz96pfkc9xooc5.png" width="94" height="94">
<img src="https://res.cloudinary.com/dpfpk49oa/image/upload/v1661426779/logo1_gyjvor.png" width="501" height="94">
<h1 align="center">Official website of Hackfest '25</h1>
</p>

<p align="center">
Hackfest '25, a 3-day national level hackathon hosted by Finite Loop Club from April 18th to 20th, 2025, at NMAM Institute of Technology, focused on the theme "Tech Olympus”. Hosted by Finite Loop Club – NMAM Institute of Technology, Nitte, and proudly powered by <b>Paloalto Networks</b> and <b>Inflow Technologies</b>, along with co-sponsorship from <b>Rakuten</b>.
</p>
<p align="center">
<a href="https://github.com/hackfest-dev/website/stargazers"><img alt="GitHub stars" src="https://img.shields.io/github/stars/hackfest-dev/website"></a>
<a href="https://github.com/hackfest-dev/website/"><img alt="GitHub stars" src="https://img.shields.io/github/last-commit/hackfest-dev/website"></a>
</p>

## Table of Contents

- [✨ Features](#features)
- [🛠️ Built with](#built-with)
- [⚙️ Project Setup](#project-setup)
- [🏋🏼 Contributors](#contributors)
- [📃 License](#license)
- [📑 Appendix](#appendix)

## Features
- Tech Olympus theme based Landing page
- Paperless system with 5 Robust dashboards with extensive features for Admin, Team, Organiser, Volunteer, Validator
- Hackathon Registration multi-step form with collecting details, team formation & idea submission
- Team Management feature with Create/Join team, Delete/leave team
- User Profile Management
- Dynamic FAQ section with anonymous QnA

## Built with

<p align="left">
<img src="https://ucarecdn.com/22a0a69b-689f-46c9-866b-57650f31fde9/-/format/jpeg/-/progressive/yes/-/preview/480x480/" height="50px">&nbsp; &nbsp; &nbsp;
<img src="https://ui-lib.com/blog/wp-content/uploads/2021/12/nextjs-boilerplate-logo.png" height="50px">&nbsp; &nbsp; &nbsp;
<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/1024px-Typescript_logo_2020.svg.png?20221110153201" height="50px">&nbsp; &nbsp; &nbsp;
<img src="https://www.svgrepo.com/show/374118/tailwind.svg" height="50px">
<img src="https://techcommunity.microsoft.com/t5/image/serverpage/image-id/118085i29BA4C3A757E0103/image-size/large?v=v2&px=999" height="50px">
<img src="https://trpc.io/img/logo.svg" height="50px">&nbsp; &nbsp; &nbsp;
<img src="https://seeklogo.com/images/Z/zod-logo-B57E684330-seeklogo.com.png" height="50px">&nbsp; &nbsp; &nbsp;
<img src="https://www.svgrepo.com/show/374002/prisma.svg" height="50px">&nbsp; &nbsp; &nbsp;
<img src="https://cdn.worldvectorlogo.com/logos/gsap-greensock.svg" height="50px">&nbsp; &nbsp; &nbsp;
<img src="https://bestofjs.org/logos/shadcnui.dark.svg" height="50px">&nbsp; &nbsp; &nbsp;
<img src="https://us.v-cdn.net/6036703/uploads/2GBTXLD32F2O/cloudinary-cloud-glyph-blue-png.png" height="50px">
</p>

- [**Three JS**](https://threejs.org/): Javascript 3D library for easy-to-use, lightweight, cross-browser rendering
- [**Next JS**](https://nextjs.org/): React-based framework for building server-side rendered and statically exported web apps.
- [**Typescript**](https://www.typescriptlang.org/): Statically typed superset of JavaScript, adds type annotations to enhance code reliability & readability
- [**TailwindCSS**](https://tailwindcss.com/): Utility-first CSS framework
- [**Azure PostgreSQL**](https://azure.microsoft.com/en-in): Fully-managed database as a service with built-in capabilities, such as high availability and intelligence.
- [**tRPC**](https://trpc.io/): Provides a simple, type-safe way to build APIs for TS & JS
- [**zod**](https://zod.dev/): Type-safe, instance-based validation library for JavaScript.
- [**React-query**](https://tanstack.com/query/latest): Library for fetching, caching and updating asynchronous data in React apps
- [**Prisma ORM**](https://www.prisma.io/): Modern, type-safe ORM for Node.js and TS.
- [**GSAP**](https://gsap.com/): A JavaScript library for creating high-performance animations and interactive experiences.
- [**Cloudinary**](https://cloudinary.com/): Cloud-based image and video management service that provides functionalities like storage, optimization, manipulation, and delivery of media assets.
- [**shadcn/ui**](https://ui.shadcn.com/): Beautifully designed components that you can copy and paste into your apps. Accessible. Customizable. Open Source.
- [**Sonner**](https://sonner.emilkowal.ski/toast): An opinionated toast component for React.

> **Note**
> This project was bootstrapped with [create-t3-app](https://create.t3.gg/)

## Project Setup

1. Fork the [project](https://github.com/hackfest-dev/website) to your account
2. Clone your fork to your local system

```bash
git clone <your fork URL here>
```

2. Install the dependencies:
> **Note**
> We prefer bun, but you can use npm or pnpm in incompatibility cases.

```bash
bun i
```

3. Generate prisma client

```bash
bunx prisma generate
```

4. Copy and Rename the .env.example to .env, place it in the root directory and fill the essential vars.

```bash
cp .env.example .env
```

> **Warning**
> Do not rename the original .env.example, it is used to keep track for env vars list as .env with values is gitignored

5. Run the development server:

```bash
bun dev
```

Open [port 3000 on localhost](http://localhost:3000) with your browser to see the website.

Additional:

```bash
bunx prisma studio
```

to use Prisma Studio(visual editor).

Open [port 5555 on localhost](http://localhost:5555) with your browser.

## Contributors

<a href="https://github.com/hackfest-dev/website/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=hackfest-dev/website" />
</a>

## License
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

This repository is licensed under [Apache License 2.0](https://github.com/hackfest-dev/website/blob/master/LICENSE)

## Appendix
- [Landing Page wireframe](https://ibb.co/WPZMpKr)
- [Registration Flow wireframe](https://ibb.co/64DwX61)
