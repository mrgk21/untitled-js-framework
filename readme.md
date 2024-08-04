## Intro
This is an experimental SSR first library to render frontend html.

## Roadmap
- [ ] File router
    - [x] page(.html/.css/.js) to render pages
    - [x] layout(.html/.css/.js) to render pages which uses a special tag to wrap page files
    - [ ] File nesting
    - [ ] Single page layout and page files
    - [ ] global and per route error handling
    - [ ] special folders, like, [id], [[id]] 
- [ ] SSR support
    - [ ] special SSR file per route, loaded when route opens
    - [ ] data fetching
        - [ ] native fetch vs axios
        - [ ] data caching and cache tags
        - [ ]  ?? cache tag maintenance, validation, invalidation + route re-rendering ??
- [ ] UI reactivity
    - [ ] signals vs proxy vs both (rnd)
    - [ ] package integration with browsers, in case of polyfill (rnd)
    - [ ] global vs local state manager
- [ ] ... lets see how it goes
