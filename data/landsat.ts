export interface LandsatItem {
  id: string;
  file: string;
  place: string;
  coords: string;
  mapUrl: string;
  date: string;
}

export const landsatCatalog: Record<string, LandsatItem[]> = {
  "a": [
    {
      "id": "a-1",
      "file": "/landsat/a-1.jpg",
      "place": "Hickman, Kentucky, United States",
      "coords": "36\u00b035'20.8 N 89\u00b020'26.9 W",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "August 31, 2023"
    },
    {
      "id": "a-2",
      "file": "/landsat/a-2.jpg",
      "place": "Hickman, Kentucky, United States",
      "coords": "36\u00b035'20.8 N 89\u00b020'26.9 W",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "August 31, 2023"
    },
    {
      "id": "a-3",
      "file": "/landsat/a-3.jpg",
      "place": "Farm Island, Maine, United States",
      "coords": "45\u00b043'43.8 N 69\u00b046'08.9 W",
      "mapUrl": "https://www.google.com/maps/place/45%C2%B043'45.4%22N+69%C2%B046'04.7%22W/@45.7292113,-69.7763592,6123m/data=!3m1!1e3!4m4!3m3!8m2!3d45.729275!4d-69.76798?entry=ttu",
      "date": "February 18, 2024"
    },
    {
      "id": "a-4",
      "file": "/landsat/a-4.jpg",
      "place": "Lake Guakhmaz, Azerbaijan",
      "coords": "40\u00b039'50.8 N 47\u00b006'36.2 E",
      "mapUrl": "https://maps.app.goo.gl/tnrVaiMuFiGacH746",
      "date": "September 2, 2024"
    },
    {
      "id": "a-5",
      "file": "/landsat/a-5.jpg",
      "place": "Yukon Delta, Alaska, United States",
      "coords": "62\u00b033'17.7 N 164\u00b056'10.3 W",
      "mapUrl": "https://maps.app.goo.gl/AuARuTMTcT2ugLnq5",
      "date": "September 22, 2002"
    },
    {
      "id": "a-6",
      "file": "/landsat/a-6.jpg",
      "place": "Lake Mj\u00f8sa, Norway",
      "coords": "60\u00b045'52.7 N 10\u00b056'43.2 E",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "June 24, 2024"
    },
    {
      "id": "a-7",
      "file": "/landsat/a-7.jpg",
      "place": "Amazon River, Peru",
      "coords": "4\u00b036'00.9\"S 74\u00b027'33.3\"W",
      "mapUrl": "https://maps.app.goo.gl/XarjUYR9hM3YZvWi6",
      "date": "March 24, 2026"
    },
    {
      "id": "a-8",
      "file": "/landsat/a-8.jpg",
      "place": "Amazon River, Peru",
      "coords": "4\u00b036'00.9\"S 74\u00b027'33.3\"W",
      "mapUrl": "https://maps.app.goo.gl/XarjUYR9hM3YZvWi6",
      "date": "March 24, 2026"
    },
    {
      "id": "a-9",
      "file": "/landsat/a-9.jpg",
      "place": "Amazon River, Peru",
      "coords": "4\u00b036'00.9\"S 74\u00b027'33.3\"W",
      "mapUrl": "https://maps.app.goo.gl/XarjUYR9hM3YZvWi6",
      "date": "March 24, 2026"
    }
  ],
  "b": [
    {
      "id": "b-1",
      "file": "/landsat/b-1.jpg",
      "place": "Madeira River, Brazil",
      "coords": "7\u00b037'00.1\"S 62\u00b055'17.0\"W",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "July 6, 2023"
    },
    {
      "id": "b-2",
      "file": "/landsat/b-2.jpg",
      "place": "Holla Bend, Arkansas, United States",
      "coords": "35\u00b008'41.1 N 93\u00b003'16.5 W",
      "mapUrl": "https://www.google.com/maps/place/35%C2%B008'41.1%22N+93%C2%B003'16.5%22W/@35.150256,-93.0998349,20284m/data=!3m1!1e3!4m4!3m3!8m2!3d35.14475!4d-93.0545833?entry=ttu",
      "date": "August 4, 2014"
    }
  ],
  "c": [
    {
      "id": "c-1",
      "file": "/landsat/c-1.jpg",
      "place": "False River, Louisiana, United States",
      "coords": "36\u00b035'20.8 N 89\u00b020'26.9 W",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "June 14, 2024"
    },
    {
      "id": "c-2",
      "file": "/landsat/c-2.jpg",
      "place": "Deception, Island, Antarctica",
      "coords": "62\u00b057'22.3 S 60\u00b038'32.8 W",
      "mapUrl": "https://www.google.com/maps/place/62%C2%B057'22.3%22S+60%C2%B038'32.8%22W/@-62.9597921,-60.8265853,38265m/data=!3m1!1e3!4m4!3m3!8m2!3d-62.9561944!4d-60.6424444?entry=ttu",
      "date": "October 16, 2020"
    },
    {
      "id": "c-3",
      "file": "/landsat/c-3.jpg",
      "place": "Black Rock Desert, Nevada, United States",
      "coords": "40\u00b047'15.8 N 119\u00b012'13.0 W",
      "mapUrl": "https://www.google.com/maps/place/40%C2%B047'15.8%22N+119%C2%B012'13.0%22W/@40.7765477,-119.2977163,26799m/data=!3m1!1e3!4m4!3m3!8m2!3d40.7877222!4d-119.2036111?entry=ttu",
      "date": "September 4, 2023"
    }
  ],
  "d": [
    {
      "id": "d-1",
      "file": "/landsat/d-1.jpg",
      "place": "Lake Tandou, Australia",
      "coords": "32\u00b037'17.8 S 142\u00b004'21.4 E",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "August 8, 2023"
    },
    {
      "id": "d-2",
      "file": "/landsat/d-2.jpg",
      "place": "Akimiski Island, Canada",
      "coords": "53\u00b000'58.5 N 81\u00b018'24.6 W",
      "mapUrl": "https://www.google.com/maps/place/53%C2%B000'58.5%22N+81%C2%B018'24.6%22W/@52.8535127,-81.6813828,147353m/data=!3m1!1e3!4m4!3m3!8m2!3d53.01625!4d-81.3068333?entry=ttu",
      "date": "2023"
    }
  ],
  "e": [
    {
      "id": "e-1",
      "file": "/landsat/e-1.jpg",
      "place": "Brei\u00f0amerkurj\u00f6kull glacier, Iceland",
      "coords": "64\u00b005'45.0 N 16\u00b021'45.6 W",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "September 25, 2015"
    },
    {
      "id": "e-2",
      "file": "/landsat/e-2.jpg",
      "place": "Bellona Plateau, Coral Sea",
      "coords": "20\u00b030'00.0 S 158\u00b030'00.0 E",
      "mapUrl": "https://www.google.com/maps/place/20%C2%B030'00.0%22S+158%C2%B030'00.0%22E/@-16.8094327,154.1932946,5.04z/data=!4m4!3m3!8m2!3d-20.5!4d158.5?entry=ttu",
      "date": "February 12, 2023"
    },
    {
      "id": "e-3",
      "file": "/landsat/e-3.jpg",
      "place": "Sea of Okhotsk",
      "coords": "54\u00b042'50.3 N 136\u00b034'20.4 E",
      "mapUrl": "https://www.google.com/maps/place/54%C2%B042'50.3%22N+136%C2%B034'20.4%22E/@54.713983,136.5674735,556m/data=!3m1!1e3!4m12!1m7!3m6!1s0x58c264a91dfb3971:0xa9181fd1ed34bb71!2sSea+of+Okhotsk!8m2!3d52.873623!4d149.3658173!16zL20vMGZ3azA!3m3!8m2!3d54.71398!4d136.572339?entry=ttu",
      "date": "September 24, 2021"
    },
    {
      "id": "e-4",
      "file": "/landsat/e-4.jpg",
      "place": "Firn-filled Fjords, Tibet",
      "coords": "29\u00b015'46.9 N 96\u00b019'03.8 E",
      "mapUrl": "https://www.google.com/maps/place/29%C2%B015'46.9%22N+96%C2%B019'03.8%22E/@29.2803917,96.192327,59727m/data=!3m1!1e3!4m13!1m8!3m7!1s0x3761317e9c4a2cc1:0x1fc12c628413da99!2sTibet,+China!3b1!8m2!3d29.6472399!4d91.11745!16zL20vMGY4bmY!3m3!8m2!3d29.26304!4d96.317724!5m1!1e4?entry=ttu",
      "date": "November 16, 2014"
    }
  ],
  "f": [
    {
      "id": "f-1",
      "file": "/landsat/f-1.jpg",
      "place": "Mato Grosso, Brazil",
      "coords": "13\u00b050'26.9 S 55\u00b017'55.0 W",
      "mapUrl": "https://maps.app.goo.gl/tXas4c27VuWi2pwk6",
      "date": "July 6, 2024"
    },
    {
      "id": "f-2",
      "file": "/landsat/f-2.jpg",
      "place": "Woodstock Dam, South Africa",
      "coords": "28\u00b044'01.3 S 29\u00b012'30.1 E",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "January 26, 2026"
    },
    {
      "id": "f-3",
      "file": "/landsat/f-3.jpg",
      "place": "Woodstock Dam, South Africa",
      "coords": "28\u00b044'01.3 S 29\u00b012'30.1 E",
      "mapUrl": "https://maps.app.goo.gl/a1UArynvAqGGYMXg6",
      "date": "January 26, 2026"
    }
  ],
  "g": [
    {
      "id": "g-1",
      "file": "/landsat/g-1.jpg",
      "place": "Fonte Boa, Amazonas",
      "coords": "2\u00b026'30.8 S 66\u00b016'43.7 W",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "April 8, 2024"
    },
    {
      "id": "g-2",
      "file": "/landsat/g-2.jpg",
      "place": "Fonte Boa, Amazonas, Brazil",
      "coords": "2\u00b026'30.8 S 66\u00b016'43.7 W",
      "mapUrl": "https://www.google.com/maps/place/2%C2%B026'30.8%22S+66%C2%B016'43.7%22W/@-2.4639488,-66.4453563,11z/data=!4m4!3m3!8m2!3d-2.4419!4d-66.2788?entry=ttu",
      "date": "April 8, 2024"
    },
    {
      "id": "g-3",
      "file": "/landsat/g-3.jpg",
      "place": "Denmark Strait, Greenland",
      "coords": "68\u00b029'27.4\"N 25\u00b041'59.9\"W",
      "mapUrl": "https://maps.app.goo.gl/n7hTQ95Dn8crGvTj7",
      "date": "July 3, 2020"
    },
    {
      "id": "g-4",
      "file": "/landsat/g-4.jpg",
      "place": "Amazon River, Peru",
      "coords": "4\u00b011'25.7\"S 73\u00b019'36.9\"W",
      "mapUrl": "https://maps.app.goo.gl/6YngnJjSwFXztAPdA",
      "date": "January 17, 2025"
    },
    {
      "id": "g-5",
      "file": "/landsat/g-5.jpg",
      "place": "Amazon River, Peru",
      "coords": "4\u00b011'25.7\"S 73\u00b019'36.9\"W",
      "mapUrl": "https://maps.app.goo.gl/6YngnJjSwFXztAPdA",
      "date": "January 17, 2025"
    },
    {
      "id": "g-6",
      "file": "/landsat/g-6.jpg",
      "place": "Amazon River, Brazil",
      "coords": "2\u00b038'48.2\"S 67\u00b008'42.3\"W",
      "mapUrl": "https://maps.app.goo.gl/TDZmb8feXv7JVkR36",
      "date": "July 24, 2025"
    },
    {
      "id": "g-7",
      "file": "/landsat/g-7.jpg",
      "place": "Amazon River, Brazil",
      "coords": "2\u00b038'48.2\"S 67\u00b008'42.3\"W",
      "mapUrl": "https://maps.app.goo.gl/TDZmb8feXv7JVkR36",
      "date": "July 24, 2025"
    },
    {
      "id": "g-8",
      "file": "/landsat/g-8.jpg",
      "place": "Amazon River, Brazil",
      "coords": "2\u00b038'48.2\"S 67\u00b008'42.3\"W",
      "mapUrl": "https://maps.app.goo.gl/TDZmb8feXv7JVkR36",
      "date": "July 24, 2025"
    }
  ],
  "h": [
    {
      "id": "h-1",
      "file": "/landsat/h-1.jpg",
      "place": "Khorinsky District, Russia",
      "coords": "52\u00b002'50.4 N 109\u00b046'51.2 E",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "2023"
    },
    {
      "id": "h-2",
      "file": "/landsat/h-2.jpg",
      "place": "Southwestern Kyrgyzstan",
      "coords": "40\u00b014'03.6 N 71\u00b014'22.8 E",
      "mapUrl": "https://maps.app.goo.gl/gRTJ6rDiiXJhT1mD9",
      "date": "August 30, 2014"
    },
    {
      "id": "h-3",
      "file": "/landsat/h-3.jpg",
      "place": "Brunswick, Maryland, United States",
      "coords": "39\u00b019'00.0\" N 77\u00b036'31.2\" W",
      "mapUrl": "https://maps.app.goo.gl/uCjdfkvT3v128kyY6",
      "date": "September 5, 2025"
    }
  ],
  "i": [
    {
      "id": "i-1",
      "file": "/landsat/i-1.jpg",
      "place": "Holuhraun Lava Field, Iceland",
      "coords": "64\u00b051'11.2 N 16\u00b049'37.2 W",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "May 23, 2014"
    },
    {
      "id": "i-2",
      "file": "/landsat/i-2.jpg",
      "place": "Djebel Ouarkziz, Morocco",
      "coords": "28\u00b018'01.5 N 10\u00b033'58.5 W",
      "mapUrl": "https://maps.app.goo.gl/osEU3NnVtShw6CBN9",
      "date": "February 6, 2019"
    },
    {
      "id": "i-3",
      "file": "/landsat/i-3.jpg",
      "place": "Etosha National Park, Namibia",
      "coords": "18\u00b029'15.2 S 16\u00b010'14.6 E",
      "mapUrl": "https://maps.app.goo.gl/s6ujVrXGJKnbrppH7",
      "date": "March 4, 2014"
    },
    {
      "id": "i-4",
      "file": "/landsat/i-4.jpg",
      "place": "Conesus Lake, New York",
      "coords": "42\u00b047'11.0 N 77\u00b042'58.1 W",
      "mapUrl": "https://maps.app.goo.gl/jNsDTfUadwb8jBVL6",
      "date": "April 26, 2024"
    },
    {
      "id": "i-5",
      "file": "/landsat/i-5.jpg",
      "place": "Borgarbygg\u00f0, Iceland",
      "coords": "64\u00b045'46.4 N 22\u00b027'28.0 W",
      "mapUrl": "https://www.google.com/maps/place/64%C2%B045'46.4%22N+22%C2%B027'28.0%22W/@64.7585629,-22.5872018,27545m/data=!3m1!1e3!4m4!3m3!8m2!3d64.7628889!4d-22.4577778?entry=ttu",
      "date": "Unknown Date"
    },
    {
      "id": "i-6",
      "file": "/landsat/i-6.jpg",
      "place": "Borgarbygg\u00f0, Iceland",
      "coords": "64\u00b045'46.4 N 22\u00b027'28.0 W",
      "mapUrl": "https://www.google.com/maps/place/64%C2%B045'46.4%22N+22%C2%B027'28.0%22W/@64.7585629,-22.5872018,27545m/data=!3m1!1e3!4m4!3m3!8m2!3d64.7628889!4d-22.4577778?entry=ttu",
      "date": "April 12, 2024"
    },
    {
      "id": "i-7",
      "file": "/landsat/i-7.jpg",
      "place": "Borgarbygg\u00f0, Iceland",
      "coords": "64\u00b045'46.4 N 22\u00b027'28.0 W",
      "mapUrl": "https://www.google.com/maps/place/64%C2%B045'46.4%22N+22%C2%B027'28.0%22W/@64.7585629,-22.5872018,27545m/data=!3m1!1e3!4m4!3m3!8m2!3d64.7628889!4d-22.4577778?entry=ttu",
      "date": "April 12, 2024"
    }
  ],
  "j": [
    {
      "id": "j-1",
      "file": "/landsat/j-1.jpg",
      "place": "Lake Superior, North America",
      "coords": "46\u00b041'10.2 N 90\u00b023'11.5 W",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "May 23, 2014"
    },
    {
      "id": "j-2",
      "file": "/landsat/j-2.jpg",
      "place": "Karakaya Dam, Turkey",
      "coords": "38\u00b029'37.7 N 38\u00b026'39.5 E",
      "mapUrl": "https://www.google.com/maps/place/72%C2%B005'01.1%22N+76%C2%B048'42.9%22W/@72.1091739,-77.3683173,70440m/data=!3m1!1e3!4m12!1m7!3m6!1s0x4e17b70e5a3af4b1:0x1e43c34c0c4309a2!2sSirmilik+National+Park!8m2!3d73.3652488!4d-79.0152625!16zL20vMDZmeDZk!3m3!8m2!3d72.083628!4d-76.811917?entry=ttu",
      "date": "August 10, 2023"
    },
    {
      "id": "j-3",
      "file": "/landsat/j-3.jpg",
      "place": "Great Barrier Reef, Australia",
      "coords": "18\u00b020'55.3 S 146\u00b050'51.4 E",
      "mapUrl": "https://www.google.com/maps/place/18%C2%B020'55.3%22S+146%C2%B050'51.4%22E/@-18.3013843,146.8642487,39611m/data=!3m1!1e3!4m4!3m3!8m2!3d-18.3487!4d146.8476?entry=ttu",
      "date": "September 1, 2023"
    }
  ],
  "k": [
    {
      "id": "k-1",
      "file": "/landsat/k-1.jpg",
      "place": "Golmud, China",
      "coords": "35\u00b036'46.3 N 95\u00b003'45.9 E",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "March 2, 2024"
    },
    {
      "id": "k-2",
      "file": "/landsat/k-2.jpg",
      "place": "Sirmilik National Park, Canada",
      "coords": "72\u00b005'01.1 N 76\u00b048'42.9 W",
      "mapUrl": "https://www.google.com/maps/place/72%C2%B005'01.1%22N+76%C2%B048'42.9%22W/@72.1091739,-77.3683173,70440m/data=!3m1!1e3!4m12!1m7!3m6!1s0x4e17b70e5a3af4b1:0x1e43c34c0c4309a2!2sSirmilik+National+Park!8m2!3d73.3652488!4d-79.0152625!16zL20vMDZmeDZk!3m3!8m2!3d72.083628!4d-76.811917?entry=ttu",
      "date": "August 3, 2015"
    }
  ],
  "l": [
    {
      "id": "l-1",
      "file": "/landsat/l-1.jpg",
      "place": "Regina, Saskatchewan, Canada",
      "coords": "50\u00b012'41.3 N 104\u00b043'38.1 W",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "July 23, 2019"
    },
    {
      "id": "l-2",
      "file": "/landsat/l-2.jpg",
      "place": "Regina, Saskatchewan, Canada",
      "coords": "50\u00b011'51.7 N 104\u00b017'15.4 W",
      "mapUrl": "https://maps.app.goo.gl/iVppLmYh44QxDr9c9",
      "date": "July 23, 2019"
    },
    {
      "id": "l-3",
      "file": "/landsat/l-3.jpg",
      "place": "Xinjiang, China",
      "coords": "40\u00b004'02.8 N 77\u00b040'00.7 E",
      "mapUrl": "https://www.google.com/maps/place/40%C2%B004'02.8%22N+77%C2%B040'00.7%22E/@40.0613207,77.5606821,20116m/data=!3m1!1e3!4m7!1m2!2m1!1sTien+Shan+mountains!3m3!8m2!3d40.067453!4d77.666852?entry=ttu",
      "date": "July 30, 2013"
    },
    {
      "id": "l-4",
      "file": "/landsat/l-4.jpg",
      "place": "Nusantara, Indonesia",
      "coords": "0\u00b058'18.1 S 116\u00b041'58.9 E",
      "mapUrl": "https://www.google.com/maps/place/0%C2%B058'18.1%22S+116%C2%B041'58.9%22E/@-0.9725262,116.6947405,2641m/data=!3m1!1e3!4m12!1m7!3m6!1s0x2df6c93c8bb52e15:0x238de9438b4d18a8!2z64iE7IKw7YOA6528!8m2!3d-0.9746384!4d116.7094308!16s%2Fm%2F03bw_z_!3m3!8m2!3d-0.971695!4d116.699694?entry=ttu",
      "date": "April 26, 2022"
    }
  ],
  "m": [
    {
      "id": "m-1",
      "file": "/landsat/m-1.jpg",
      "place": "Tian Shan Mountains, Kyrgyzstan",
      "coords": "42\u00b007'16.4 N 80\u00b002'44.1 E",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "August 14, 2015"
    },
    {
      "id": "m-2",
      "file": "/landsat/m-2.jpg",
      "place": "Paw Paw Bends, Potomac River",
      "coords": "38\u00b046'32.2 N 78\u00b024'07.1 W",
      "mapUrl": "https://www.google.com/maps/place/Shenandoah+River/@38.7773712,-78.4192219,6454m/data=!3m1!1e3!4m7!3m6!1s0x89b6047d550cb7f7:0x83e4ccba6e682c02!4b1!8m2!3d39.1019371!4d-77.9660084!16zL20vMDMzejYz?entry=ttu",
      "date": "September 27, 2016"
    },
    {
      "id": "m-3",
      "file": "/landsat/m-3.jpg",
      "place": "Shenandoah River, Virginia, United States",
      "coords": "38\u00b046'32.2 N 78\u00b024'07.1 W",
      "mapUrl": "https://www.google.com/maps/place/Shenandoah+River/@38.7773712,-78.4192219,6454m/data=!3m1!1e3!4m7!3m6!1s0x89b6047d550cb7f7:0x83e4ccba6e682c02!4b1!8m2!3d39.1019371!4d-77.9660084!16zL20vMDMzejYz?entry=ttu",
      "date": "August 3, 2013"
    },
    {
      "id": "m-4",
      "file": "/landsat/m-4.jpg",
      "place": "Shenandoah River, Virginia, United States",
      "coords": "38\u00b046'32.2 N 78\u00b024'07.1 W",
      "mapUrl": "https://www.google.com/maps/place/Shenandoah+River/@38.7773712,-78.4192219,6454m/data=!3m1!1e3!4m7!3m6!1s0x89b6047d550cb7f7:0x83e4ccba6e682c02!4b1!8m2!3d39.1019371!4d-77.9660084!16zL20vMDMzejYz?entry=ttu",
      "date": "June 3, 2026"
    },
    {
      "id": "m-5",
      "file": "/landsat/m-5.jpg",
      "place": "Shenandoah River, Virginia, United States",
      "coords": "38\u00b046'32.2 N 78\u00b024'07.1 W",
      "mapUrl": "https://www.google.com/maps/place/Shenandoah+River/@38.7773712,-78.4192219,6454m/data=!3m1!1e3!4m7!3m6!1s0x89b6047d550cb7f7:0x83e4ccba6e682c02!4b1!8m2!3d39.1019371!4d-77.9660084!16zL20vMDMzejYz?entry=ttu",
      "date": "June 3, 2026"
    },
    {
      "id": "m-6",
      "file": "/landsat/m-6.jpg",
      "place": "Paw Paw Bends, Potomac River",
      "coords": "39\u00b035'37.9\" N 78\u00b025'24.0\" W",
      "mapUrl": "https://maps.app.goo.gl/2CmsvHPFtanEGpgi9",
      "date": "June 3, 2026"
    },
    {
      "id": "m-7",
      "file": "/landsat/m-7.jpg",
      "place": "Paw Paw Bends, Potomac River",
      "coords": "39\u00b035'37.9\" N 78\u00b025'24.0\" W",
      "mapUrl": "https://maps.app.goo.gl/2CmsvHPFtanEGpgi9",
      "date": "June 3, 2026"
    }
  ],
  "n": [
    {
      "id": "n-1",
      "file": "/landsat/n-1.jpg",
      "place": "S\u00e3o Miguel do Araguaia, Brazil",
      "coords": "12\u00b056'44.3 S 50\u00b029'42.0 W",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "August 2, 2024"
    },
    {
      "id": "n-2",
      "file": "/landsat/n-2.jpg",
      "place": "Yapacani, Bolivia",
      "coords": "17\u00b018'29.7 S 63\u00b053'19.0 W",
      "mapUrl": "https://maps.app.goo.gl/5rXL3mESWj2YsTWj6",
      "date": "March 27, 2024"
    },
    {
      "id": "n-3",
      "file": "/landsat/n-3.jpg",
      "place": "Yapacani, Bolivia",
      "coords": "17\u00b018'29.7 S 63\u00b053'19.0 W",
      "mapUrl": "https://maps.app.goo.gl/5rXL3mESWj2YsTWj6",
      "date": "March 27, 2024"
    }
  ],
  "o": [
    {
      "id": "o-1",
      "file": "/landsat/o-1.jpg",
      "place": "Manicouagan Reservoir, Canada",
      "coords": "51\u00b022'42.4 N 68\u00b040'27.2 W",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "2024"
    },
    {
      "id": "o-2",
      "file": "/landsat/o-2.jpg",
      "place": "Crater Lake, Oregon, United States",
      "coords": "42\u00b056'10.0 N 122\u00b006'04.7 W",
      "mapUrl": "https://maps.app.goo.gl/S9sJeZ6iHBVJuGu37",
      "date": "March 18, 2023"
    }
  ],
  "p": [
    {
      "id": "p-1",
      "file": "/landsat/p-1.jpg",
      "place": "Riberalta, Bolivia",
      "coords": "10\u00b052'44.0 S 66\u00b002'52.0 W",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "June 24, 2024"
    },
    {
      "id": "p-2",
      "file": "/landsat/p-2.jpg",
      "place": "Mackenzie River Delta, Canada",
      "coords": "68\u00b012'54.4 N 134\u00b023'15.3 W",
      "mapUrl": "https://www.google.com/maps/place/68%C2%B012'54.4%22N+134%C2%B023'15.3%22W/@68.2079858,-134.5221453,23980m/data=!3m1!1e3!4m4!3m3!8m2!3d68.215103!4d-134.387585?entry=ttu",
      "date": "November 1, 2023"
    }
  ],
  "q": [
    {
      "id": "q-1",
      "file": "/landsat/q-1.jpg",
      "place": "Mount Tambora, Indonesia",
      "coords": "8\u00b014'31.3 S 117\u00b059'31.2 E",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "June 19, 2024"
    },
    {
      "id": "q-2",
      "file": "/landsat/q-2.jpg",
      "place": "Lonar Crater, India",
      "coords": "19\u00b058'36.8 N 76\u00b030'30.6 E",
      "mapUrl": "https://maps.app.goo.gl/vNSZuSEAV22k2UScA",
      "date": "March 9, 2024"
    }
  ],
  "r": [
    {
      "id": "r-1",
      "file": "/landsat/r-1.jpg",
      "place": "Canyonlands National Park, Utah, United States",
      "coords": "38\u00b026'27.8 N 109\u00b045'03.3 W",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "May 13, 2014"
    },
    {
      "id": "r-2",
      "file": "/landsat/r-2.jpg",
      "place": "Florida Keys, United States",
      "coords": "24\u00b045'30.4 N 81\u00b031'53.6 W",
      "mapUrl": "https://maps.app.goo.gl/CfSnUcNriFtWBrEQ8",
      "date": "February 15, 2024"
    },
    {
      "id": "r-3",
      "file": "/landsat/r-3.jpg",
      "place": "Lago Menendez, Argentina",
      "coords": "42\u00b041'14.9 S 71\u00b052'21.7 W",
      "mapUrl": "https://www.google.com/maps/place/42%C2%B041'14.9%22S+71%C2%B052'21.7%22W/@-42.6921215,-71.9452812,30666m/data=!3m1!1e3!4m12!1m7!3m6!1s0x961c217407edac45:0xb660993af48f583f!2sLake+Men%C3%A9ndez!8m2!3d-42.6849165!4d-71.8274846!16s%2Fg%2F120l2rkc!3m3!8m2!3d-42.687479!4d-71.872688?entry=ttu",
      "date": "January 21, 2015"
    }
  ],
  "s": [
    {
      "id": "s-1",
      "file": "/landsat/s-1.jpg",
      "place": "Rio Chapare, Bolivia",
      "coords": "16\u00b056'04.7 S 65\u00b013'44.2 W",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "June 20, 2023"
    },
    {
      "id": "s-2",
      "file": "/landsat/s-2.jpg",
      "place": "N\u2019Djamena, Chad",
      "coords": "12\u00b000'27.7 N 15\u00b003'46.2 E",
      "mapUrl": "https://www.google.com/maps/place/12%C2%B000'27.7%22N+15%C2%B003'46.2%22E/@12.0046806,15.0451832,17158m/data=!3m1!1e3!4m13!1m8!3m7!1s0x11196053fc686ffb:0xf9442c3f64221374!2sDigangali,+Chad!3b1!8m2!3d12.0619444!4d15.0727778!16s%2Fg%2F11nmsbmc9w!3m3!8m2!3d12.007689!4d15.062824?entry=ttu",
      "date": "October 23, 2022"
    },
    {
      "id": "s-3",
      "file": "/landsat/s-3.jpg",
      "place": "Mackenzie River",
      "coords": "68\u00b025'01.0 N 134\u00b008'35.2 W",
      "mapUrl": "https://www.google.com/maps/place/Tuktoyaktuk,+NT,+Canada/@68.408019,-134.2820739,33486m/data=!3m1!1e3!4m6!3m5!1s0x5113cb935c41b04d:0x1155e872d8421ea3!8m2!3d69.445358!4d-133.034181!16zL20vMDNwOXF4?entry=ttu",
      "date": "November 7, 2016"
    },
    {
      "id": "s-4",
      "file": "/landsat/s-4.jpg",
      "place": "Araguaia River, Brazil",
      "coords": "13\u00b001'27.8\"S 50\u00b035'00.9\"W",
      "mapUrl": "https://maps.app.goo.gl/Vy2tA4JnZgkcsTzi6",
      "date": "July 7, 2026"
    },
    {
      "id": "s-5",
      "file": "/landsat/s-5.jpg",
      "place": "Araguaia River, Brazil",
      "coords": "13\u00b001'27.8\"S 50\u00b035'00.9\"W",
      "mapUrl": "https://maps.app.goo.gl/Vy2tA4JnZgkcsTzi6",
      "date": "July 7, 2026"
    }
  ],
  "t": [
    {
      "id": "t-1",
      "file": "/landsat/t-1.jpg",
      "place": "Lena River Delta, Russia",
      "coords": "72\u00b052'40.3 N 129\u00b031'51.5 E",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "July 13, 2021"
    },
    {
      "id": "t-2",
      "file": "/landsat/t-2.jpg",
      "place": "Liwa, United Arab Emirates",
      "coords": "23\u00b010'30.0 N 53\u00b047'52.8 E",
      "mapUrl": "https://maps.app.goo.gl/ozu6s25LfPTmiXFb9",
      "date": "March 9, 2015"
    }
  ],
  "u": [
    {
      "id": "u-1",
      "file": "/landsat/u-1.jpg",
      "place": "Canyonlands National Park, Utah, United States",
      "coords": "38\u00b016'09.1 N 109\u00b055'32.7 W",
      "mapUrl": "https://www.google.com/maps/place/38%C2%B016'09.1%22N+109%C2%B055'32.7%22W/@38.2749009,-110.0024741,14590m/data=!3m1!1e3!4m12!1m7!3m6!1s0x8747e1ee4518a6a9:0x15a452a9c502e6aa!2sCanyonlands+National+Park!8m2!3d38.2135733!4d-109.9025345!16zL20vMDF3cTgz!3m3!8m2!3d38.269198!4d-109.925762?entry=ttu",
      "date": "May 13, 2014"
    },
    {
      "id": "u-2",
      "file": "/landsat/u-2.jpg",
      "place": "Bamforth National Wildlife Refuge, Wyoming, United States",
      "coords": "41\u00b019'26.0 N 105\u00b046'13.9 W",
      "mapUrl": "https://www.google.com/maps/place/Bamforth+National+Wildlife+Refuge/@41.2734513,-106.0072281,91289m/data=!3m1!1e3!4m12!1m5!3m4!2zNDHCsDIwJzE3LjUiTiAxMDXCsDQ4JzUwLjAiVw!8m2!3d41.3382!4d-105.8139!3m5!1s0x8768812b9b07cc19:0x839bb585413c393f!8m2!3d41.3777918!4d-105.7317396!16zL20vMGJnMGY5?entry=ttu",
      "date": "Unknown Date"
    },
    {
      "id": "u-3",
      "file": "/landsat/u-3.jpg",
      "place": "Bamforth National Wildlife Refuge, Wyoming, United States",
      "coords": "41\u00b019'26.0 N 105\u00b046'13.9 W",
      "mapUrl": "https://www.google.com/maps/place/Bamforth+National+Wildlife+Refuge/@41.2734513,-106.0072281,91289m/data=!3m1!1e3!4m12!1m5!3m4!2zNDHCsDIwJzE3LjUiTiAxMDXCsDQ4JzUwLjAiVw!8m2!3d41.3382!4d-105.8139!3m5!1s0x8768812b9b07cc19:0x839bb585413c393f!8m2!3d41.3777918!4d-105.7317396!16zL20vMGJnMGY5?entry=ttu",
      "date": "Unknown Date"
    },
    {
      "id": "u-4",
      "file": "/landsat/u-4.jpg",
      "place": "Southern Coast of Greenland",
      "coords": "62\u00b038'51.6\"N 42\u00b014'45.6\"W",
      "mapUrl": "https://maps.app.goo.gl/kyvNq3pB4SnonST59",
      "date": "August 4, 2025"
    },
    {
      "id": "u-5",
      "file": "/landsat/u-5.jpg",
      "place": "Southern Coast of Greenland",
      "coords": "62\u00b038'51.6\"N 42\u00b014'45.6\"W",
      "mapUrl": "https://maps.app.goo.gl/kyvNq3pB4SnonST59",
      "date": "August 4, 2025"
    }
  ],
  "v": [
    {
      "id": "v-1",
      "file": "/landsat/v-1.jpg",
      "place": "Mapleton, Maine",
      "coords": "46\u00b032'40.5 N 68\u00b015'06.4 W",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "June 2, 2024"
    },
    {
      "id": "v-2",
      "file": "/landsat/v-2.jpg",
      "place": "New South Wales, Australia",
      "coords": "34\u00b017'11.2 S 150\u00b049'32.4 E",
      "mapUrl": "https://maps.app.goo.gl/fxE1ik8qzdANidxT8",
      "date": "November 5, 2013"
    },
    {
      "id": "v-3",
      "file": "/landsat/v-3.jpg",
      "place": "Cellina and Meduna Rivers, Italy",
      "coords": "46\u00b006'41.4 N 12\u00b045'26.6 E",
      "mapUrl": "https://www.google.com/maps/place/46%C2%B006'41.4%22N+12%C2%B045'26.6%22E/@46.1123599,12.6682228,45913m/data=!3m1!1e3!4m4!3m3!8m2!3d46.1115!4d12.7574?entry=ttu",
      "date": "September 21, 2010"
    }
  ],
  "w": [
    {
      "id": "w-1",
      "file": "/landsat/w-1.jpg",
      "place": "Ponoy River, Russia",
      "coords": "67\u00b002'10.9 N 40\u00b020'19.3 E",
      "mapUrl": "https://maps.app.goo.gl/z6n8HY91r7f4kv9G7",
      "date": "July 26, 2024"
    },
    {
      "id": "w-2",
      "file": "/landsat/w-2.jpg",
      "place": "Ponoy River, Russia",
      "coords": "67\u00b002'10.9 N 40\u00b020'19.3 E",
      "mapUrl": "https://maps.app.goo.gl/z6n8HY91r7f4kv9G7",
      "date": "July 26, 2024"
    },
    {
      "id": "w-3",
      "file": "/landsat/w-3.jpg",
      "place": "La Primavera, Colombia",
      "coords": "5\u00b026'57.9 N 69\u00b047'57.0 W",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "April 13, 2024"
    },
    {
      "id": "w-4",
      "file": "/landsat/w-4.jpg",
      "place": "Bogda Mountains, China",
      "coords": "",
      "mapUrl": "https://www.google.com/maps/search/?api=1&query=Bogda%20Mountains%2C%20China",
      "date": "Landsat Archive"
    }
  ],
  "x": [
    {
      "id": "x-1",
      "file": "/landsat/x-1.jpg",
      "place": "Sermersooq Municipality, Greenland",
      "coords": "66\u00b037'05.2 N 36\u00b022'05.9 W",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "August 17, 2024"
    },
    {
      "id": "x-2",
      "file": "/landsat/x-2.jpg",
      "place": "Davis Strait, Greenland",
      "coords": "62\u00b014'14.8 N 49\u00b034'49.9 W",
      "mapUrl": "https://www.google.com/maps/place/62%C2%B014'14.8%22N+49%C2%B034'49.9%22W/@62.2576372,-50.2124668,119807m/data=!3m1!1e3!4m4!3m3!8m2!3d62.237433!4d-49.580516?entry=ttu",
      "date": "September 3, 2023"
    },
    {
      "id": "x-3",
      "file": "/landsat/x-3.jpg",
      "place": "Wolstenholme Fjord, Greenland",
      "coords": "76\u00b044'03.8 N 68\u00b036'23.3 W",
      "mapUrl": "https://www.google.com/maps/place/76%C2%B044'03.8%22N+68%C2%B036'23.3%22W/@76.769809,-69.2574316,78627m/data=!3m1!1e3!4m12!1m7!3m6!1s0x4e363cf35b4fee17:0x41fd8c3cf71f8024!2sWolstenholme+Fjord!8m2!3d76.6170514!4d-69.0542596!16zL20vMGJqd3dn!3m3!8m2!3d76.734386!4d-68.606478?entry=ttu",
      "date": "September 2, 1973"
    }
  ],
  "y": [
    {
      "id": "y-1",
      "file": "/landsat/y-1.jpg",
      "place": "Tasman Glacier, New Zealand",
      "coords": "43\u00b031'19.4 S 170\u00b049'53.7 E",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "April 7, 2024"
    },
    {
      "id": "y-2",
      "file": "/landsat/y-2.jpg",
      "place": "Estuario de Virrila, Peru",
      "coords": "5\u00b051'53.4 S 80\u00b043'51.6 W",
      "mapUrl": "https://www.google.com/maps/place/5%C2%B051'53.4%22S+80%C2%B043'51.6%22W/@-5.8409555,-80.83445,12.13z/data=!4m12!1m7!3m6!1s0x90497ce60f8e3bc1:0x703ee5f60c9c907d!2sEstuario+de+Virrila!8m2!3d-5.7988889!4d-80.8647222!16s%2Fg%2F12ls2ksqv!3m3!8m2!3d-5.864833!4d-80.730992?entry=ttu",
      "date": "February 24, 2023"
    },
    {
      "id": "y-3",
      "file": "/landsat/y-3.jpg",
      "place": "B\u00edob\u00edo River, Chile",
      "coords": "37\u00b016'02.4 S 72\u00b043'42.9 W",
      "mapUrl": "https://www.google.com/maps/place/37%C2%B016'02.4%22S+72%C2%B043'42.9%22W/@-37.2890838,-72.7147119,11.54z/data=!4m12!1m7!3m6!1s0x9612d6239f78768f:0x62a4a840164470ae!2zQsOtb2LDrW8gUml2ZXI!8m2!3d-37.6673574!4d-72.163673!16zL20vMDZiZmdu!3m3!8m2!3d-37.267341!4d-72.728582?entry=ttu",
      "date": "February 3, 2023"
    }
  ],
  "z": [
    {
      "id": "z-1",
      "file": "/landsat/z-1.jpg",
      "place": "Mohammed Boudiaf, Algeria",
      "coords": "34\u00b059'19.3 N 4\u00b023'20.8 E",
      "mapUrl": "https://www.google.com/maps/place/36%C2%B035%2720.8%22N+89%C2%B020%2726.9%22W/@36.5689533,-89.4212718,11.38z/data=!4m4!3m3!8m2!3d36.5891111!4d-89.3408056?entry=ttu",
      "date": "March 15, 2024"
    },
    {
      "id": "z-2",
      "file": "/landsat/z-2.jpg",
      "place": "Primavera do Leste, Brazil",
      "coords": "15\u00b029'38.9 S 54\u00b020'27.5 W",
      "mapUrl": "https://www.google.com/maps/place/15%C2%B029'38.9%22S+54%C2%B020'27.5%22W/@-15.4976757,-54.3580248,14215m/data=!3m1!1e3!4m13!1m8!3m7!1s0x9377238863d94d8d:0xac7e6dab9bd8285e!2sPrimavera+do+Leste+-+State+of+Mato+Grosso,+Brazil!3b1!8m2!3d-15.5605334!4d-54.2950533!16s%2Fm%2F09rs3h3!3m3!8m2!3d-15.494126!4d-54.34096?entry=ttu",
      "date": "June 29, 2024"
    }
  ],
  "0": [
    {
      "id": "0-1",
      "file": "/landsat/0-1.jpg",
      "place": "Lake Waccamaw, North Carolina, USA",
      "coords": "34\u00b017'16.7\"N 78\u00b030'44.3\"W",
      "mapUrl": "https://maps.app.goo.gl/iFZcewDgx7niUQCC9",
      "date": "May 19, 2025"
    },
    {
      "id": "0-2",
      "file": "/landsat/0-2.jpg",
      "place": "Lake Waccamaw, North Carolina, USA",
      "coords": "34\u00b017'16.7\"N 78\u00b030'44.3\"W",
      "mapUrl": "https://maps.app.goo.gl/a6CYbuVE8AyKUnpm6",
      "date": "May 19, 2025"
    }
  ],
  "1": [
    {
      "id": "1-1",
      "file": "/landsat/1-1.jpg",
      "place": "Conesus Lake, New York, United States",
      "coords": "42\u00b047'11.0 N 77\u00b042'58.1 W",
      "mapUrl": "https://maps.app.goo.gl/a6CYbuVE8AyKUnpm6",
      "date": "April 26, 2024"
    }
  ],
  "2": [
    {
      "id": "2-1",
      "file": "/landsat/2-1.jpg",
      "place": "Pennsylvania Hills, United States",
      "coords": "40\u00b021'59.6\"N 78\u00b021'23.7\"W",
      "mapUrl": "https://maps.app.goo.gl/jNsDTfUadwb8jBVL6",
      "date": "November 25, 2021"
    },
    {
      "id": "2-2",
      "file": "/landsat/2-2.jpg",
      "place": "Pennsylvania Hills, United States",
      "coords": "40\u00b021'59.6\"N 78\u00b021'23.7\"W",
      "mapUrl": "https://maps.app.goo.gl/ux2zyVqonjbAUXdP6",
      "date": "November 25, 2021"
    },
    {
      "id": "2-3",
      "file": "/landsat/2-3.jpg",
      "place": "Great Fish River Nature Reserve, South Africa",
      "coords": "33\u00b003'56.6\"S 26\u00b049'52.9\"E",
      "mapUrl": "https://maps.app.goo.gl/MygAmafYKnBZxECi7",
      "date": "Unknown Date"
    },
    {
      "id": "2-4",
      "file": "/landsat/2-4.jpg",
      "place": "Great Fish River Nature Reserve, South Africa",
      "coords": "33\u00b003'56.6\"S 26\u00b049'52.9\"E",
      "mapUrl": "https://maps.app.goo.gl/MygAmafYKnBZxECi7",
      "date": "Unknown Date"
    }
  ],
  "3": [
    {
      "id": "3-1",
      "file": "/landsat/3-1.jpg",
      "place": "Lake Massinger, Mozambique",
      "coords": "23\u00b053'13.6\"S 32\u00b002'54.7\"E",
      "mapUrl": "https://maps.app.goo.gl/ux2zyVqonjbAUXdP6",
      "date": "August 8, 2025"
    },
    {
      "id": "3-2",
      "file": "/landsat/3-2.jpg",
      "place": "Lake Massinger, Mozambique",
      "coords": "23\u00b053'13.6\"S 32\u00b002'54.7\"E",
      "mapUrl": "https://maps.app.goo.gl/tLmRsnQR1MvJBJXx7",
      "date": "August 8, 2025"
    },
    {
      "id": "3-3",
      "file": "/landsat/3-3.jpg",
      "place": "Province of Sondrio, Italy",
      "coords": "46\u00b017'38.3 N 9\u00b025'14.5 E",
      "mapUrl": "https://maps.app.goo.gl/MDCo37rLRQGCvDJp8",
      "date": "April 7, 2023"
    },
    {
      "id": "3-4",
      "file": "/landsat/3-4.jpg",
      "place": "Province of Sondrio, Italy",
      "coords": "46\u00b017'38.3 N 9\u00b025'14.5 E",
      "mapUrl": "https://maps.app.goo.gl/MDCo37rLRQGCvDJp8",
      "date": "April 7, 2023"
    }
  ],
  "4": [
    {
      "id": "4-1",
      "file": "/landsat/4-1.jpg",
      "place": "Lac Assinica, Quebec, Canada",
      "coords": "50\u00b024'34.1\"N 74\u00b057'48.0\"W",
      "mapUrl": "https://maps.app.goo.gl/tLmRsnQR1MvJBJXx7",
      "date": "August 16, 2024"
    },
    {
      "id": "4-2",
      "file": "/landsat/4-2.jpg",
      "place": "Lac Assinica, Quebec, Canada",
      "coords": "50\u00b024'34.1\"N 74\u00b057'48.0\"W",
      "mapUrl": "https://maps.app.goo.gl/ikEWbcgFsMvTkx7X6",
      "date": "August 16, 2024"
    }
  ],
  "5": [
    {
      "id": "5-1",
      "file": "/landsat/5-1.jpg",
      "place": "Yukon, Canada",
      "coords": "66\u00b020'25.7\"N 134\u00b021'01.7\"W",
      "mapUrl": "https://maps.app.goo.gl/ikEWbcgFsMvTkx7X6",
      "date": "August 13, 2025"
    },
    {
      "id": "5-2",
      "file": "/landsat/5-2.jpg",
      "place": "Yukon, Canada",
      "coords": "66\u00b020'25.7\"N 134\u00b021'01.7\"W",
      "mapUrl": "https://maps.app.goo.gl/1mni2QzeFdrWW8hP6",
      "date": "August 13, 2025"
    }
  ],
  "6": [
    {
      "id": "6-1",
      "file": "/landsat/6-1.jpg",
      "place": "Amazon River, Peru",
      "coords": "4\u00b011'25.7\"S 73\u00b019'36.9\"W",
      "mapUrl": "https://maps.app.goo.gl/1mni2QzeFdrWW8hP6",
      "date": "January 17, 2025"
    },
    {
      "id": "6-2",
      "file": "/landsat/6-2.jpg",
      "place": "Amazon River, Peru",
      "coords": "4\u00b011'25.7\"S 73\u00b019'36.9\"W",
      "mapUrl": "https://maps.app.goo.gl/6YngnJjSwFXztAPdA",
      "date": "January 17, 2025"
    }
  ],
  "7": [
    {
      "id": "7-1",
      "file": "/landsat/7-1.jpg",
      "place": "Regina, Saskatchewan, Canada",
      "coords": "50\u00b011'51.7 N 104\u00b017'15.4 W",
      "mapUrl": "https://maps.app.goo.gl/6YngnJjSwFXztAPdA",
      "date": "July 23, 2019"
    },
    {
      "id": "7-2",
      "file": "/landsat/7-2.jpg",
      "place": "Regina, Saskatchewan, Canada",
      "coords": "50\u00b011'51.7 N 104\u00b017'15.4 W",
      "mapUrl": "https://maps.app.goo.gl/iVppLmYh44QxDr9c9",
      "date": "July 23, 2019"
    }
  ],
  "8": [
    {
      "id": "8-1",
      "file": "/landsat/8-1.jpg",
      "place": "Hudson Bay, Ontario, Canada",
      "coords": "55\u00b052'34.3\"N 87\u00b052'27.5\"W",
      "mapUrl": "https://maps.app.goo.gl/THfZmmsHE2qc25ZU6",
      "date": "July 3, 2026"
    },
    {
      "id": "8-2",
      "file": "/landsat/8-2.jpg",
      "place": "Hudson Bay, Ontario, Canada",
      "coords": "55\u00b052'34.3\"N 87\u00b052'27.5\"W",
      "mapUrl": "https://maps.app.goo.gl/iVppLmYh44QxDr9c9",
      "date": "July 3, 2026"
    },
    {
      "id": "8-3",
      "file": "/landsat/8-3.jpg",
      "place": "Hudson Bay, Ontario, Canada",
      "coords": "55\u00b052'34.3\"N 87\u00b052'27.5\"W",
      "mapUrl": "https://maps.app.goo.gl/THfZmmsHE2qc25ZU6",
      "date": "July 3, 2026"
    }
  ],
  "9": [
    {
      "id": "9-1",
      "file": "/landsat/9-1.jpg",
      "place": "Holla Bend, Arkansas, United States",
      "coords": "35\u00b008'41.1 N 93\u00b003'16.5 W",
      "mapUrl": "https://www.google.com/maps/place/35%C2%B008'41.1%22N+93%C2%B003'16.5%22W/@35.150256,-93.0998349,20284m/data=!3m1!1e3!4m4!3m3!8m2!3d35.14475!4d-93.0545833?entry=ttu",
      "date": "August 4, 2014"
    }
  ]
};
