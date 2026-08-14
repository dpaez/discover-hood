# Address Insights

Discover your neighborhood
___

## Check it out

Visit: [discover-hood.vercel.app](https://discover-hood.vercel.app/) 

## Work done

I started taking some notes of the work requirements, then scaffolded the basics. I like to do this manually so I'm aware of the dependencies and force them to be minimal.

Then, I jumped to excalidraw to get an idea of the look'n'feel of the project. This also helps me to organize components and discover some of the API flow. 

<img width="6964" height="2021" alt="address-insights-idea" src="https://github.com/user-attachments/assets/c3dddaba-9376-4c4c-bdb7-3917a8517fcc" />


After this, I went back to the app and worked around the initial behavior. This includes the basic components. I spent some time thinking about the rendering model and I decided to stick it initially with a SPA-like model and then enhance with some RSC and leverage the server-side of next. I had in mind the initial navigation when the app is shared with a lat/lon. 
For the geo provider I went with locationIQ since it was the most direct one in terms of seing the API/request/response ASAP.

Up to this point I had the basics in place so I can start delegating to the AI with confidence. Since I already have some API routes I asked to create a new one, following the style of the others. I decided to have this "Backend for Frontend style". There is an api directory that is one of the main connectors with the geolocation API. Here we can also parse the response and adapt it to the frontend.

After this point all the basic features were working, the integration with the geo provider was ok. So I started to working on improvements. Here the agent was quite useful. I asked to review my routes and look for improvements around caching. I wanted to explore the chance to use next [Cache Components](https://nextjs.org/docs/app/getting-started/caching). 

Another useful improvement with AI was to review and audit `a11y`. This was particularly important for the Address.tsx, History.tsx and PopularLocations.tsx components. 

## The stack
- Next16
- React 19
- TailwindCSS
- Shadcn
- SWR
- maplibre-gl

## Some caveats

- Testing Next API (Backend-for-frontend): Initially I wanted to use vitest to add some unit tests but almost immediately noticed that you need something more specific because next machinery is in the middle of it. After checking the docs, the Next team recommends E2E tests at this moment. I ended up adding playwright. I think this is something to revisit with more time.
- Rate Limiting: Similarly to the testing scenario. I wanted to add some rate-limit library for next and found that with the recent upgrade to next16 there aren't many solid options. So I decide to delegate the creation of a simple in-memory rate limiting tool to the agent. Again, something to revisit with more time.
- LocationIQ Possible bug: the [nearby API](https://docs.locationiq.com/reference/nearby-poi-api) was quite handy to get the points of interest around the address. The `radius` property changed the results range but seems like they are using a different scale. The results include an undocumented `distance` property with values that usually go from 1 to 500 max and the radius can go up to 500000 (500KM). Perhaps it is a 1:10 relation.

## Development

- Clone and install. The project is using pnpm.

```bash
pnpm i
```
- Then, run the dev server
```bash
pnpm run dev
```


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
