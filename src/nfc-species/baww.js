import React, { Component } from 'react'
const ReactMarkdown = require('react-markdown')

// TODO Take input from file and display it dynamically for each file

const input = `
# NFCs: Black-and-white Warbler

The Black-and-white Warbler has a distinctive and, most often, an easily recognizable NFC. All of the following information refers to the _dzit_ or _dzinn_ call. This call is given both diurnally and nocturnally (Evans 2002, Pieplow 2017, Kricher 2020).

### Published References

Pieplow (2017) identifies it as a "Dzit", noting:

> Very short, very high buzzy note. Shorter and usually finer than Burry Seet. {The BAWW's is} often rising; see Sreet, p.501.

> Dzit... rising or monotone. ... given all year, often in flight, including by night migrants.

Evans (2002) notes:

> A delicate "dzinn" with a fine sibilant buzz, often slightly rising. Many calls have a subtle two-parted character, while others are nearly monotone.

> Most similar to Blue-winged and Golden-winged Warblers but the subtle two-parted character is usually distinctive. Also compare to Chestnut-sided Warbler.

> **Spectrographic description:** Measured calls (N=13) were 56-87.5 (68.3) mS in duration and in the 6.6-10.8 (7.2-9.3) kHz frequency range. The frequency track was single or double-banded, typically with an initial relatively short section of descent followed by a longer variably rising and downward-arched section. It was modulated with a spacing of 3.5-4.1 (3.8) mS between humps and a depth of 0.7-1.2 (1) kHz.

Birds of the World notes (Kricher 2020):

> Call note is a sharp chip or pit, similar to that of Blackpoll Warbler (Griscom and Sprunt 1957, Terres 1980b), with many variations (Allison in Bent 1953b). During breeding, females call when close to mate and away from nest. Paired males also call sometimes, probably to keep in contact with female. On wintering grounds, call note is a thin, weak tsit or tseep, reportedly difficult for humans to hear (Stiles and Skutch 1989).

It is unclear to me wehterh the tsit or tseep described in Stiles and Skutch (1989) is different from the chip or pit calls. There is no mention of NFCs in BotW.

### Example calls

The best call that is involves a bird that was seen, recorded, and commented upon in the checklist is here: https://ebird.org/checklist/S62295811.

Other calls:

- OldBird: http://oldbird.org/pubs/fcmb/species/warblers/baww/baww.htm
- Xeno-canto: [1](https://www.xeno-canto.org/550454)
- eBird Search: https://ebird.org/media/catalog?taxonCode=bawwar&behaviors=c,fc&mediaType=a&q=Black-and-white%20Warbler
- eBird daytime call: [1](https://macaulaylibrary.org/asset/234433151) [2](https://macaulaylibrary.org/asset/227148391) _Note: These were presumably seen, but there is no comment._

### Salient points

_This section may not be helpful. The idea is to make it easier to rule out other species more easily without going through the whole list, which may not be possible._

- Two parted (rules out NOWA, LOWA, KEWA, CSWA)
  - If two-partedness does not involve tail, rules out BWWA
  - If two-partedness does not include modulation changes, rules out GWWA
- Wavelength under 4.1mS (rules out NOWA, LOWA, KEWA, CSWA)
- More than 10 waves (rules out NOWA, LOWA, BLPW, KEWA)

### Similar species

The following species were noted as being similar by the cited experts. Any notes underneath the species can be used to rule out the other species for particular calls.

When describing this call in comments on an NFC checklist, try and add as many salient notes as possible and refer to this page for justification. If there are any species which seem similar, please get in touch so we can add them here. The intent here is to have a full list of differences for each possible similar call.

- Northern Waterthrush (Pieplow)
  - Always rising (Evans 2002)
  - Not two-parted (Evans 2002)
  - Longer spacing between humps: averages 11.2mS (Evans 2002)
  - Depth can be shallower: 0.4-1.3 (0.7) kHz (Evans 2002)
  - 3-9 humps (Evans 2002)
- Louisiana Waterthrush (Pieplow)
  - LOWA not two-parted (Evans 2002)
  - LOWA level or slightly rising (Evans 2002)
  - LOWA humps spaced longer: 13.6-17 (15.6) mS (Evans 2002)
  - LOWA has almost identical depth to BAWW (Evans 2002)
  - LOWA has an average of 4.5 humps (Evans 2002), to the BAWW's 20 or so (No citation)
- Kentucky Warbler (Pieplow)
  - Single banded (Evans 2002)
  - Slightly rising (Evans 2002)
  - 6 humps (Evans 2002) compared to BAWW 20 or so (No citation)
  - Longer spacing: averages 9.2mS to BAWW 3.8mS (Evans 2002)
  - Depth similar, but depth for KEWA increases over the course of the call (Evans 2002)
  - Duration similar (Evans 2002)
- Blue-winged Warbler (Evans 2002)
  - Shorter than 70mS (Evans 2002)
  - Lower than 8.7mS, averaging 5.7-8.2kHz (Evans 2002)
  - Lower frequency tail at end, lacking in BAWW (Evans 2002)
  - Average longer space between humps (5.8mS). Can go down to 3.6mS in spacing. (Evans 2002)
  - Depth averages lower, not larger than 860kHz (Evans 2002)
- Golden-winged Warbler (Evans)
  - Can be two parted, but this was due to a switch in modulation from a spacing of 3.7mS, depth 250kHz to 7mS, depth 920kHz. (Evans 2002)
  - GWWA call not longer than 64mS (Evans 2002), so some overlap for short calls, but not for longer ones.
  - Single banded (Evans 2002)
  - Rising (Evans 2002)
  - Calls not rising above 8kHz range (Evans 2002)
- Chestnut-sided warbler (Evans)
  - BAWW and CSWA similar in length and generally even modulation
  - Not two parted
  - Also monotone, descending, or arched downward (Evans 2002)
  - Lower on average: highest call is 8kHz. (Evans 2002)
  - Hump spacing longer and not overlapping:  5.5-7.1 (6.5) mS between humps (Evans 2002)
  - Can be shallower: .5-1kHz depth, compared to BAWW .7-1.2kHz (Evans 2002)
- Blackpoll Warbler (Kricher 2020)
  - Generally shorter, at 40-59.9 (50.2) mS in duration. (Evans 2002)
  - Lower: not registered above 9.1khZ (Evans 2002)
  - Single banded (Evans 2002)
  - 2-4 humps (Evans 2002)
  - Longer wavelength: averaging 14.6mS (Evans 2002)
  - Depth can go up to 1.8kHz (Evans 2002)

### References

* Evans, W. R. and O’Brien, M. (2002) _Flight Calls of Migratory Birds Eastern North American Landbirds_. Old Bird Inc. [CD-ROM]. [Online] http://oldbird.org
* Kricher, J. C. (2020). _Black-and-white Warbler (Mniotilta varia)_, version 1.0. In Birds of the World (A. F. Poole, Editor). Cornell Lab of Ornithology, Ithaca, NY, USA. https://doi.org/10.2173/bow.bawwar.01
* Pieplow, Nathan (2017) _Peterson Field Guide to Bird Sounds of Eastern North America_. Houghton Mifflin Harcourt: New York.

#### Referenced but not yet verified

* Bent, A. C. (1953). Life histories of North American wood warblers. United States National Museum Bulletin 203.
* Griscom, L., and A. Sprunt Jr. (1957). The Warblers of America: A Popular Account of the Wood-Warblers as They Occur in the Western Hemisphere. Doubleday, New York, NY, USA.
* Stiles, F. G., and A. F. Skutch (1989) A Guide to the Birds of Costa Rica. Cornell University Press, Ithaca, NY, USA.
* Terres, J. K. (1980). The Audubon Society Encyclopedia of North American Birds. Alfred A. Knopf, New York, NY, USA.

`

class NFC extends Component {
  render() {
    return (
      <div className="container-md page">
        <div className="row" style={{'display': 'block'}} >
          <ReactMarkdown source={input} />
        </div>
      </div>
    )
  }
}

export default NFC