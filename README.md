# Address Insights

Discover your neighborhood
___

## Check it out

Visit: 

## Work done

I started taking some notes of the work requirements, then scaffolded the basics. I like to do this manually so I'm aware of the dependencies and force them to be minimal.

Then, I jumped to excalidraw to get an idea of the look'n'feel of the project. This also helps me to organize components and discover some of the API flow. 

After this, I went back to the app and worked around the initial behavior. This includes the basic components. I spent some time thinking about the rendering model and I decided to stick it initially with a SPA-like model and then enhance with some RSC and leverage the server-side of next. I had in mind the initial navigation when the app is shared with a lat/lon. 
For the geo provider I went with locationIQ since it was the most direct one in terms of seing the API/request/response ASAP.

Up to this point I had the basics in place so I can start delegating to the AI with confidence. Since I already have some API routes I asked to create a new one, following the style of the others. I decided to have this "Backend for Frontend style". There is an api directory that is one of the main connectors with the geolocation API. Here we can also parse the response and adapt it to the frontend.

After this point all the basic features were working, the integration with the geo provider was ok. So I started to working on improvements. Here the agent was quite useful. I asked to review my routes and look for improvements around caching. I wanted to explore the chance to use next [Cache Components](https://nextjs.org/docs/app/getting-started/caching). 
Another useful improvement with AI was to review and audit `a11y`. This was particularly important for the Address.tsx, History.tsx and PopularLocations.tsx components. 

## Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
