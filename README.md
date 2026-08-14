# Address Insights

Discover your neighborhood
___

## Check it out

Visit: [discover-hood.vercel.app](https://discover-hood.vercel.app/) 

## Work done

I started from notes on the requirements, then scaffolded the basics by hand so I could keep dependencies minimal and understand each one.

Next I sketched the look and feel in Excalidraw. That also helped me organize components and map out the basic API flow.

<img width="6964" height="2021" alt="address-insights-idea" src="https://github.com/user-attachments/assets/c3dddaba-9376-4c4c-bdb7-3917a8517fcc" />

I then implemented the initial app behavior and basic components. I chose a SPA-like model first, with room to add RSC and more server-side Next features later. I wanted to leverage the server-side with the shared lat/lon deep links. For geolocation I picked LocationIQ because it was straight to the API docs and no much business talk in the middle. 

With that foundation in place, I was comfortable delegating to AI. I already had initial API routes, so I asked the agent to add another in the same style (reverse geocoding). I settled on a Backend-for-Frontend approach: the `api` directory talks to the geolocation provider, then shapes the response for the frontend.

Once the core features and LocationIQ integration were working, I focused on improvements. The agent helped review routes and caching state, I wanted to explore the chance to use Next [Cache Components](https://nextjs.org/docs/app/getting-started/caching). Another useful pass was an accessibility audit, especially for `Address.tsx`, `History.tsx`, and `PopularAddresses.tsx`.

## The stack
- Next16
- React 19
- TailwindCSS
- Shadcn
- SWR
- maplibre-gl

## Some caveats

- Testing Next API (Backend-for-frontend): Initially I wanted to use vitest to add some unit tests but almost immediately noticed that you need something more specific because Next machinery is in the middle of it. After checking the docs, the Next team recommends E2E tests at this moment. I ended up adding playwright. I think this is something to revisit with more time.
- Rate Limiting: Similarly to the testing scenario. I wanted to add some rate-limit library for Next and found that with the recent upgrade to Next 16 there aren't many solid options. So I decide to delegate the creation of a simple in-memory rate limiting tool to the agent. Again, something to revisit with more time.
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
