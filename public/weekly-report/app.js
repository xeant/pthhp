const state = {
  rows: [],
  photoDays: []
};

const $ = (selector) => document.querySelector(selector);
const LOGO_DATA_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARcAAAA5CAYAAAAcAm8mAAAACXBIWXMAAAsTAAALEwEAmpwYAAAKT2lDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjanVNnVFPpFj333vRCS4iAlEtvUhUIIFJCi4AUkSYqIQkQSoghodkVUcERRUUEG8igiAOOjoCMFVEsDIoK2AfkIaKOg6OIisr74Xuja9a89+bN/rXXPues852zzwfACAyWSDNRNYAMqUIeEeCDx8TG4eQuQIEKJHAAEAizZCFz/SMBAPh+PDwrIsAHvgABeNMLCADATZvAMByH/w/qQplcAYCEAcB0kThLCIAUAEB6jkKmAEBGAYCdmCZTAKAEAGDLY2LjAFAtAGAnf+bTAICd+Jl7AQBblCEVAaCRACATZYhEAGg7AKzPVopFAFgwABRmS8Q5ANgtADBJV2ZIALC3AMDOEAuyAAgMADBRiIUpAAR7AGDIIyN4AISZABRG8lc88SuuEOcqAAB4mbI8uSQ5RYFbCC1xB1dXLh4ozkkXKxQ2YQJhmkAuwnmZGTKBNA/g88wAAKCRFRHgg/P9eM4Ors7ONo62Dl8t6r8G/yJiYuP+5c+rcEAAAOF0ftH+LC+zGoA7BoBt/qIl7gRoXgugdfeLZrIPQLUAoOnaV/Nw+H48PEWhkLnZ2eXk5NhKxEJbYcpXff5nwl/AV/1s+X48/Pf14L7iJIEyXYFHBPjgwsz0TKUcz5IJhGLc5o9H/LcL//wd0yLESWK5WCoU41EScY5EmozzMqUiiUKSKcUl0v9k4t8s+wM+3zUAsGo+AXuRLahdYwP2SycQWHTA4vcAAPK7b8HUKAgDgGiD4c93/+8//UegJQCAZkmScQAAXkQkLlTKsz/HCAAARKCBKrBBG/TBGCzABhzBBdzBC/xgNoRCJMTCQhBCCmSAHHJgKayCQiiGzbAdKmAv1EAdNMBRaIaTcA4uwlW4Dj1wD/phCJ7BKLyBCQRByAgTYSHaiAFiilgjjggXmYX4IcFIBBKLJCDJiBRRIkuRNUgxUopUIFVIHfI9cgI5h1xGupE7yAAygvyGvEcxlIGyUT3UDLVDuag3GoRGogvQZHQxmo8WoJvQcrQaPYw2oefQq2gP2o8+Q8cwwOgYBzPEbDAuxsNCsTgsCZNjy7EirAyrxhqwVqwDu4n1Y8+xdwQSgUXACTYEd0IgYR5BSFhMWE7YSKggHCQ0EdoJNwkDhFHCJyKTqEu0JroR+cQYYjIxh1hILCPWEo8TLxB7iEPENyQSiUMyJ7mQAkmxpFTSEtJG0m5SI+ksqZs0SBojk8naZGuyBzmULCAryIXkneTD5DPkG+Qh8lsKnWJAcaT4U+IoUspqShnlEOU05QZlmDJBVaOaUt2ooVQRNY9aQq2htlKvUYeoEzR1mjnNgxZJS6WtopXTGmgXaPdpr+h0uhHdlR5Ol9BX0svpR+iX6AP0dwwNhhWDx4hnKBmbGAcYZxl3GK+YTKYZ04sZx1QwNzHrmOeZD5lvVVgqtip8FZHKCpVKlSaVGyovVKmqpqreqgtV81XLVI+pXlN9rkZVM1PjqQnUlqtVqp1Q61MbU2epO6iHqmeob1Q/pH5Z/YkGWcNMw09DpFGgsV/jvMYgC2MZs3gsIWsNq4Z1gTXEJrHN2Xx2KruY/R27iz2qqaE5QzNKM1ezUvOUZj8H45hx+Jx0TgnnKKeX836K3hTvKeIpG6Y0TLkxZVxrqpaXllirSKtRq0frvTau7aedpr1Fu1n7gQ5Bx0onXCdHZ4/OBZ3nU9lT3acKpxZNPTr1ri6qa6UbobtEd79up+6Ynr5egJ5Mb6feeb3n+hx9L/1U/W36p/VHDFgGswwkBtsMzhg8xTVxbzwdL8fb8VFDXcNAQ6VhlWGX4YSRudE8o9VGjUYPjGnGXOMk423GbcajJgYmISZLTepN7ppSTbmmKaY7TDtMx83MzaLN1pk1mz0x1zLnm+eb15vft2BaeFostqi2uGVJsuRaplnutrxuhVo5WaVYVVpds0atna0l1rutu6cRp7lOk06rntZnw7Dxtsm2qbcZsOXYBtuutm22fWFnYhdnt8Wuw+6TvZN9un2N/T0HDYfZDqsdWh1+c7RyFDpWOt6azpzuP33F9JbpL2dYzxDP2DPjthPLKcRpnVOb00dnF2e5c4PziIuJS4LLLpc+Lpsbxt3IveRKdPVxXeF60vWdm7Obwu2o26/uNu5p7ofcn8w0nymeWTNz0MPIQ+BR5dE/C5+VMGvfrH5PQ0+BZ7XnIy9jL5FXrdewt6V3qvdh7xc+9j5yn+M+4zw33jLeWV/MN8C3yLfLT8Nvnl+F30N/I/9k/3r/0QCngCUBZwOJgUGBWwL7+Hp8Ib+OPzrbZfay2e1BjKC5QRVBj4KtguXBrSFoyOyQrSH355jOkc5pDoVQfujW0Adh5mGLw34MJ4WHhVeGP45wiFga0TGXNXfR3ENz30T6RJZE3ptnMU85ry1KNSo+qi5qPNo3ujS6P8YuZlnM1VidWElsSxw5LiquNm5svt/87fOH4p3iC+N7F5gvyF1weaHOwvSFpxapLhIsOpZATIhOOJTwQRAqqBaMJfITdyWOCnnCHcJnIi/RNtGI2ENcKh5O8kgqTXqS7JG8NXkkxTOlLOW5hCepkLxMDUzdmzqeFpp2IG0yPTq9MYOSkZBxQqohTZO2Z+pn5mZ2y6xlhbL+xW6Lty8elQfJa7OQrAVZLQq2QqboVFoo1yoHsmdlV2a/zYnKOZarnivN7cyzytuQN5zvn//tEsIS4ZK2pYZLVy0dWOa9rGo5sjxxedsK4xUFK4ZWBqw8uIq2Km3VT6vtV5eufr0mek1rgV7ByoLBtQFr6wtVCuWFfevc1+1dT1gvWd+1YfqGnRs+FYmKrhTbF5cVf9go3HjlG4dvyr+Z3JS0qavEuWTPZtJm6ebeLZ5bDpaql+aXDm4N2dq0Dd9WtO319kXbL5fNKNu7g7ZDuaO/PLi8ZafJzs07P1SkVPRU+lQ27tLdtWHX+G7R7ht7vPY07NXbW7z3/T7JvttVAVVN1WbVZftJ+7P3P66Jqun4lvttXa1ObXHtxwPSA/0HIw6217nU1R3SPVRSj9Yr60cOxx++/p3vdy0NNg1VjZzG4iNwRHnk6fcJ3/ceDTradox7rOEH0x92HWcdL2pCmvKaRptTmvtbYlu6T8w+0dbq3nr8R9sfD5w0PFl5SvNUyWna6YLTk2fyz4ydlZ19fi753GDborZ752PO32oPb++6EHTh0kX/i+c7vDvOXPK4dPKy2+UTV7hXmq86X23qdOo8/pPTT8e7nLuarrlca7nuer21e2b36RueN87d9L158Rb/1tWeOT3dvfN6b/fF9/XfFt1+cif9zsu72Xcn7q28T7xf9EDtQdlD3YfVP1v+3Njv3H9qwHeg89HcR/cGhYPP/pH1jw9DBY+Zj8uGDYbrnjg+OTniP3L96fynQ89kzyaeF/6i/suuFxYvfvjV69fO0ZjRoZfyl5O/bXyl/erA6xmv28bCxh6+yXgzMV70VvvtwXfcdx3vo98PT+R8IH8o/2j5sfVT0Kf7kxmTk/8EA5jz/GMzLdsAAAAgY0hSTQAAeiUAAICDAAD5/wAAgOkAAHUwAADqYAAAOpgAABdvkl/FRgAARO9JREFUeNrsfXeYXVW5/rvWrqeXmTNneu/phYQQQglNKdIUQQUscCkq2K/1KnaRK4piQVHEBiKIIC0QIAQSAunJpEzvc86Z0+uua/3+OJMoCgqKP8ud93n28+RMZu+zZu+13/WV9/sW4ZxjHvOYxzxeb9D5WzCPecxjnlzmMY95zJPLPOYxj3lymcc85jGP1x3i33pibLIPgkAhSRJyuSwcagDTMzH4K2XAZuCcYXJiHIYB1NVXg0CHW61CpjQOZkpwSM2AkAanJrzuKlCBYGxsCg6njcoqBYpag2xOgs2KCAYdMDQNpmFBVpyw4QAIgSwCqlwOSBuajlwmDogCigUOWRYgCQRV1TXYu2cLRkYP4g1veAsUpxeWVYKWT8HtrwSzOJhpwBaKMIpOTE6OobYujJKWAgBUVjVCFCRwlL+Hg4MwiuH+MahOGelsGqVSCYsWLIDFrNd8HwkBLAvIFcjcZ4pEYgZVlU4EAkEwZv/R7xLkswWAcFAUoZV0+Cpq4HS5y2OzdRAiAiAANZFJzGImEoHHE4RbDsHtkSC4KBhjyBcItKwBvWCBEALOAZsX0NheUz5/7q+1ikXEZykcHt/Rn86NBpzbSKaHwcEQcImwYMHlC4MxgmQiB7ebopSPoirUAnAZROIgMgD+au4LgWUaMEs6DA3wB/0QZI5SMQHL5vB4AtBKNkSR4vDhfRAED6oqqxHwCTCMBFLpKehaHn5vD7y+IHSDYWRoDE6vG16fG6mEDlkwEaz0oFg0QUQB3mAIffsOQBFdqKgIgjEGQjgsMw9BdIERC2AMlApHx8k54PU5IMsi/qbkCOGgTEZmugIHhkcRDviwe08/unu6sHffbnQtdCHor0UuwzExnG3JlGaWTE1EzpQE11mGpjoJBDBmwWY2COGQFAuVlc4R23LcmIqpffUduX2ldC381TGce8liMG6DUFoeKy/PZ15+1BBpeT4CgEDC/zxymcc85vEPdisohawQOjA4fvreF+LvNLTimY0tVZ61q4+F02WBCgpsWwBjALMFiCIHoUVYJl02E83/KpM/xPbtMp8RmfKzpTX81+momncHDMxGC5AUGaIkQoIASRRBJQvEof3RwoJ5cpnHPP7TQAiBospIp7On/+bOyBfDtcIxJ5++BA5RQN/eSTxwz26MDs0iEc/CMC0wiwOUQ5II3F6K1rZqLFrajePXrqR+f+Ck3dvHTtq9dfoTVnHoe8uWtXwrmTVsh1eC0yXABQc8DgVw64CzBPB5cpnHPP4z4xQiBeek6onHtn6tkMNlF1ywjubSJfziuzuxa/sAcrksKBUgiQ5QIgNQQQgDtwRYhoRkDoiOpvDshs2QnRYWLA3ggrcvxbuuOL79sUd3/+/dvxi58Jh1LdeE6ir2EkJAOC9HXsnrr3ebJ5d5zONfBJIkIpO0l2x68rlfn3rGqs7enuX43jcewrNPjYAyEarkhEcOlF0XYgBCHiAlwHYClAHQIVAbkmwCxARjbux7QceurZvQvexZXP3h06CKLcf97OcPP7PeKly1eMmCuwkh/7C/Zz5bNI95/NPBoSgCYrOxM3/2i7ufuvzyszr97mq8753fx+YnhuFUFbhcABVzIEICREiCEA2EKSCWC4QDhBMQLoBAAGEiiK1AIEW4XDo8bgWD+yx85IrfYc/2YXzkY2/xbXpqx12bN2/5sNul4B/FL/PkMo95/J1gjINQ+pqPcsaNQJRlRKYzqzc/seWeK689JdC3K47/vuZ+5NMEbq8JygBmu8AEA4wyMKsGjNpg0jQYnOCQABBQWgA1qgE7AEhxgDLYjAFCAk6pHjKvwA+/9Thuu3EbPvy+yzB2YPKmJzbsuEaU8A8hmHm3aB7z+DutDttmoKLwmlLRhHCYeTeI7sB0qlD/3R/+8DeXve0tzk0PjeC2bz8Bp1wNUTbAuQGAgDAFMCsBqoNLEXBiAtwJEB2EC4AYA+MuQI4AxATXFpYtGXEErBSCaY2CCgYUUcYjD+5AOhvDJ79yAb7+1Ttv9fkrkmtPrb2bgFMOsHnLZR7z+DeHzWxoJpF/cefGn5x+xqr6idEsbv/OFjicBFQZA5gEoneBMCc4y4HbMdhmFtB8IGY1uB0El2LgYhKG1gqLuWELBmwo4EIGnEdAbIaOThHnv13CaedyeKRquB0ytj4zgztuexzvv+5t5KEHt90SjxebCSQQ0NeNFuYtl3nM43UAwavSBr4Eqovgwd/vvcbjdpwa9Nbjw/99GyTVgiiIgOUH4Q5YLAEqxhGu9SFUYwFExswoQ3R2GgIqAV4NzoqoqE2gUODQdQ5KTZh6FjUh4Px3MTS0xDFymKGqVoDXmcVvfwG4PSLuvWMaLS2HcNabllfde9czN777PWdfpOkczCYINc1bLvOYxz+XVAiBrpvQdROcA5y9moMDnGI2WqjZvq3vM+tPPga33PgQ9KIMkVUDViUoEWGYKdTUW7jg7WEcd4oX4epGhMJuXHR1GsefNQimFcFKcRyztoAz3iSBWTIABivnRkuTjPd/gUCkFfjWp9z4zv848PzmWQhqDJymIYDAKfnxg29uRTBkQi/Qt2x9dvrsdJzCYpl5y+XvmRDz+M80HwiloJSCEAJCSPnflIKQf1zfImYzGJoFURLBX0XIghAOwj14esOO9y1aGq7YsW0Y+3fF4HW7QWGCMDcss4D2XgvrTqnFtmeGMXDAAc3g0LM+JOIxXHbVEszsTaJ3qYLuZSp+etsMjGIVbLsSzR3TeP+nZAwOMtx+8yRKqUa0LY9j4bI23PfTDJgtQ9c4BDmKQo7jl7fvwFsvPRUbNrz4icWr5N9X1RUBBObJ5RVNMkohCBQQyjUfjLGyuQkBlvXqa4DKQToKUp40BADhjDMQAkEQQCkFJQSiIICBveb6EkLxD534/8lMQo4+AwJCKGzLrsxlij26ka4oFHKNhl7wijS7l1AxxbkYIYQMHCGeV150/raFR9N0gDtAoPxVB4kIQDGuVAwcmLzyvAvW4IYPPwiH5ARggktZcEOBoMSxYo0PmzfEMLCvFbKah0wKqOu0UFMdwOG9wJUfCUF1lvC/NxiYiQYhUIIabwrv/3gahUINfvqNMLSsiY6Vgzj34gpsui+A6QETCxYzeMMJjA4RRKeCeG7jDM5/ewwS9R2XjefeWFWnPPo3eHn/7uRCyjkz/soWCRUE2LZen0rlT2KWXjMxMb6kUMxrbo/beXhgr9/jqXkUYD8I+lX9la5RnmScMA5eyEQhEi8khwOCQDlnhGuFPCzLWjw7O7uypJUaNF1zDo2OxAJ+/+8ppYdfU9YAHCAKAOn1eJ7/JyBQAYAFw9Sr0uniukKheEKxlKrLZZO6Kssy4XyHQ22IuxxSKpfXmkbHDp0iy0qlaVrM5Hafoko/o5ROveSa5XkD0zRWKaIzBmD0D9GUv24Jc2ZjdjqPUoH91bSuJBEMHZ46qaGuKTQ5OouR4RhcYhAEOZgwQCwv3E4DVIohGivCFiQwaRK9XbU49cI8tj7O8fTDKVz/WRlPPlrEyKgPcLoAm+Bt706jutLApz6Sh2baWP8mCb3L2vHQnRpKpYN436crYNsCpkfr0dVr4He/NDEdLWLzE4ewYuUabNs8c3VTT/UjkvxPdIsIoSpAGOfcIIQ6y5JBWIQQcELmos4EnDNwzr2UkuwRM5UT4iSE2BxEP1KRW+ZzYhNCqSAIrPxMiQAQQgi1BEFAySrVCaakQ3TE/2zCCQI0rbQ8EZn5CLggOFzOvW6PbxOl9MGOYJeRTI6KkZm8WirFrp+N9+9ctWL1tS5UbaICAzPLE0QUJRQKxTdMTY2eH6wIfpSCZSVCkYqnoDotMKLLqUTx3ERy6t2y4pxRna5NJU27dzYeN8LV4aUTIwM319e2v1mgtMhfLVFwDoOWSzrmnbW/SisQRZEmEqlTRif63xdPZr3ccg57XN4nly7u3S1L7nFVVXOzM7NQZA9kyYFcMYpcrohgMABRkTo1M3/p8OihX6ti9R2hoOuHgiBAEJgSi0XPTA3s/ohlSSnqCf03oxQ2Y3BIDNwmr+JpEsguDbbtAhX+cihTUURMzhw4p7dtGR55aAPAhHL4k4ugVhUglFAsmYhHXDjz/CaMjubQ0BkCt4Hf3B7C2PAo3nm9DlnxY9sGP5yCiqIWwbpTK7D6hFr89q4IvB6Gk652IZ2exh3fUtHWU8S7PtCIzY8ZePqxKRi6Exdda0J2eqEoDmzbVMIZZ1Js2TKyePvzBXXNCU3aP41cIpGxW31+/++DwarfJhLTn/d4rS3FYs4l57TJUqHQVyyV3gXwBwgh65PJJKdEWyiFfB/NZpLXpVNGncTJM7IjPwHRuHJBb/W7s9n0FaVSJpUvZBzxhH7Wgt7wRbqWP0Y3cif4vOR3hw4e+rwiSxlBkOP1zYs+xTnnlJCjJnFiNnrGzHTk483tLbeFa+ruZhaYxUzIigOABcXRjmBQgyxZNzz66NNjffu3fXft8a0LpsenEK6tgGnq3fv2bnmfqZNFtdWtHw1XN2XNQh7cLECSKXL57Mmjk/tuBSeptqaFN/grghuSmSyy+Tza2xrR1dXcv3db7ENOxRFUVbX4aq0XKnJkdRMFjc+zyys7QKBEQC4zfcXI8MD1hZIx4K+oeKKhvu7nXo8j5XaosCwdmWwKhaKCqWgcDimPhsYqcG7DsmzYtg2FKv11dfWfCdc0fHN2euob0ejoyYbhvzeT1T5sw+5rb+v5ZiAYejiRLBUMg4FCB2fsVVkvnAOyIqAIF/JZ8S+6uoYmKplUaaXLI+BQXxSSJM/V9lAQWwDEOGB68MzjKfQuluB1+/Hi5jGMDEmw00GsOkHFulP8+MFXc0jGm+HwlNDaBLzpohR0UkKoeiE6OcczD9oY2t+ItedM4qJrgLu/pWPH0x5woQpr3piHXgghGbUhSxTRqTiy2TQ8HmedStu6AOz5p5GLyaONJY2dCt6QLGiRdZW1jrF2b/jePTt3f8/hFEcdDuX+XE6/uqmp7UvhunAsOj2yaXR44GqDpVe5nP5ZgWq/Zqx0AlBa5PbLyBX0VlnWp3SzSHP59Fui0xMfCAQDL1pm8bP9B8dvqKmpu72urun9xYIhm2aOM9uCxUUULArTMFrHRwe+3tnde4HH7x0ECBizYeoGBApQSZQYZ2YmqaOqypuqrWmLDx0a7o1PjZ8dGUvtyeVjl45HDnwmXF2/f9my406xDC1rG0kIcEBnrGVsbM9XZpOpc5o7G7/Z1Fj3VavoyYEALqcDLc2NEASCyfHk6SA0AgGRkll61R6OyykBxrw79MqxMwGMW86+/fs/l87OdIdCvs9UhVvup6IAr7cSgmzUlAqZVbFIrH42lq73+av7c/nSdiaxfUTIIhh2IF/0Q5VcCFRWwLIKIIwnamvde6fG9tyUSkcvWb1m/RkClTYIqgBKBbgcElAqweQmqCyDUsDiXCKUmH/J5yFgoFIaVHKC0leOsRUKrJoSta2kaYhMGRAEBUe0a5Sa4CQHkApYejN2bYuBmmlAroBlivD7Z3DhJSEkY0lwKuKsqw+grl7EgtYQquszuPtnCp56NIdCrAKcFbHy5Awuf7+C+35Sgeef8EDyjmH1uiC6epvxwN1T4ESFABeKpQymJ2bR2FIpbXiof+2y45v+eeRCBc7iidmOTGJgSdHI1ycSkzmfi0+D40XTNJsrQhUvZPPmRaIixCTJgMPh/igjEx8M+Ksvz2SKHxaV2F2K5LnPhpC1DAMlTZ9gXKacO/jSZYu+Ot4fPdHWEx8UVMFZKmYRrlnxg5Jm8YOHJ84Mejlxu133RSNpRCJx2JZ5andvMwlUBQfBTOTzSUhEgZ4tIhtLoKa90UzGRh2H+tIXMKsp0rNg3fWlvPaB4dEXvsoMXj+xL+VbsXrN9Y2drd8HVENxEJjaNE3E4mf07X3+h0TU5XUnn3WFy13zK9NIQvE5IEoEYlGAYdqYmhx7W6FYeGdvz6JrXQ6XVV7tXj5k9IelDgC1QUWO+Q0YXmFyiiIyidTawf7hz7od3ofb2nr/2+13cI/bg3yh6Jmemr4kkRh+u9OlGj5fTaSru44Xc/pgLlm4zjRLec75J0WJlFo7GwBTBSQJhWwBI2PDV6VmY+/s7Fzyrkgs+SbLphFZVkHAYWgl2MUSREEAh4R0OrMuk0p+0LKxhotkX3VV3eWiKM683DNjjMPtteD0mq+4uIgSxfhIJuD1VKjJVBy6RqBIFggnALFAmQxGnLCIDSKYECw3OKOQqY6GNoJTzkqhqVXAnt3jaGzvxti4F+mYgZPWjWO834VHHvAhr7kgS0W0tSVx5ccCePGZEjbcqyPUpGPt6TJcgRjuu1NBNidAVHTAJKDMianRHLpXuGDor49E5W8mF2a6aV1d8Ba3M/DgdKR+wcChQS/sBCxdGFIcor+qTigwwEilohfLivbC0ED8DURkD0fjM1mHw/VZgB2yTOw3GehMdGR1OpVfy5m8h9tOe2RoelfI773t4L4X+nqWLXvC7XbLu3ftvLy7q+UWy8qsS2d4SpSE+xhnUFQHTINqumHKts1QyCdhmCVIShiSqCBXygQP79t7aV6PfcBfRfsqq33vVZ3ujWvWnHHX5ND2D44N77lpzZpTr6hu6rqd2waIIACGIA8cOvCLg/sPv7mhuufexpaq//L6K5KlvIlCnqCySgEox2xsbOlsPHMVeLZm8dLFX1FV3yDjdjlU9KdkDDrX9YuDgCCfy8IpCwCE/1PujcDpX7fqCGDbFqKxyPlDA4e+3d3Ve5XPV/GQ6pQACMLU1Pg10zMTZ8uCY7cqey5ra2saU9UaADaCHo66upqfHTqwY0MiHvua09t+HUABIoCV8v6RkX23R6Zn1y077oSzg+7wC8lYvzgxMvHOzgULP2SWdMRno/B7PCBEUMfGhr/KWem/2ju6vxSoqHpg954Xbyhp2dUej+f+l3N7CeGwLIpc/pWDuqJIkU7m3LKsoJDPgVkUkAFOrLIQjyngoABn0K0IqkIWFi/oRmunCad/COvWe7Hz2Sy+94VFyJUqoYn9uPIaBxyOADb+3od8pgbEFYHLVcLbr1ERHRPw+L0mTjozhPqeHAb2ebHjNwKILUFUKLitgAglMM6QjFtQVQWdC8JV/1RysY3At4pZ5z6ZyjCLgV+oYnOOizaooO0nkGZT8SJ8XucXM+nE1aZltTPOnzVN60nLNlVRUtoJF79ZUVF5Wzo3PjkzPXteJp2OqKp7N7OkRLFolcKV9SMtvevWqS6/2tRZuePwgb7PjYxMfkKgRigY6rhXUlRUe0W0dihgjN1/8ND+U/N793w/EHQ8QQXohex4u5bXm/K53HGKKuxoa+++xu8PPwYGDstGZGbsS/v7Nn28o+OsL1TXt90OgYJQJywzf9zeLdvuGB0/2LFw5Ynfrgo2X2dyE7FEEiIoikVD7ds/s9a2S9eapsYrAtU/BlEeVlUHGNifuedHPmbScei6CUlSQShHKZ+Cs6rm/1zshHDyV8mFEAHFUrr98KF9X12weNWlVRXhpzgvwNBL5/T3Hbq1WMT2mob2q00zO6oqDgiCG4AFgJXJW5AM1eX/XUEvrAVUMJMBTKvYu2vD/dPRqZVLl761QyLVk5qZh57PrQRJHavICykxcowzHbou9xw6vOungSr34ILFC8+lJPT4THT82Fw2l+rqXPiCLMt/JjngHKCUQNNsJFMpUDqXRfpTEiIUlmUKEiToBQZuA+ACOGEAlwBiw9YFeINxHLteQXNzE4YGp/DYbxhOO9OPbFHAffeoyHAL1DuKjhoPTl8fx/5DOjZuVQCSh1TUcP5bPFi8MoZNDxOsf0MLxiOzeOCXElIZBkVRQAWtTGJzYyRiEYauQaQKStqs/59KLoTg94QAjDGA8GcoJeAgoJTuEwjdZ9sMAJ11Or1fcLtD0PKzc8wtaeHqpv2pRHw/4zYUVb3D6Qgjk87MPSAKSRJBqASHS9rhcDghiCJaWxd8vFDMolgsIBCohCBIIISDCgyyJGerwzXvSiZnLorHjF7LZgLhWtTpZg8tO27ZV7mpRdhcNB5gGB7cfvO2bY9/oLtnySNN7e03MF7Wq5Tys2/a9uxjv0hGE+41q9/0rlBj6x1FvQSLS754MrKalQqnZTNW0LDIeEtL3TeqqiqfM0sGorEMXq7eyzYsCAJABQnpeAREcIK4JBDC8H8RlmlBN0t/tTERJRIGR/bf0NBYGa0OVT+lpTlyxek3Hjrcf0t1VdsdoVDgsxY4dzgV1NQ2AeAUYAQgNpEIOLGQyiTPDVeHdgNAYnK8YnBwz++j8f1tK1ZccGUiO3h5Ps22tC0gM9P5TW9rqFm6gcNiBBy6Xjr5wMF993T2dN7X3rn0v8BKiE5OntY/svOu1pYVb3Y4XNO2bf/BMiEEZC4rSimBaeThcYuwbALDsCEI5CVuLxUEUArbtEsQBDonqBNAuAiQEmyToXdlCsedxjHeX4W7bk9gdsaNnoU6TnxzCb+/18DQ/ko43bPQNAsnni7A4wvhxbsn0FwbRNMZ4+jqEHDsmjQ2PESw+TEBY8MxlPQCiCDDIYfAGQVocY7uRQASCC/HmygVYTPG/6nk8irIZ47ROThnf+Kb2kcZ/eX+/0hQgjM+10iYw7JMcM7AGDvaOFkQ+JxAjsNmzHa7/b9ilhOmBQhUA+NRUCKCQwCxJIAAM8M7b9u19fdXVlWu2LKg57RLuFCwqSyjGJu5eNvmB36cLcQdy45dPSKqnq17duy/FKp+vMGtFrfT1e9W3c/quva4Q3IlqmsbQCmHXtD/TJ9CQKDlS2C6DYdPORqYxJyG5l9VIXxkbEdeBkLo6zpWwimcLhVE4H/RvtF1Wy3kzQW9vYs/CNtAJpk5Zv/Bnb9qbO3+VEd7761TU5MgggCHw1lO4cLiZcZiAJGQSAy/O5me7WhvW3BuMZmtGh595qnp6fHGqlD7+umZ4cXJvKat7l7+3ME9996fMQ54Flae8lOUgMRs4trBwa23di1Y+6W29p5Pa4U8pieGPzk5MfGu6tqaS8LVNU+xP46nEQJu6zBZDqoaAAFFJjmJ6upmSJKEyekiLFt4SeZIlAQoDtlgPA+/JwgqMlBQEC7CsGNYfaKIZcdRPHqXD6P9Kij1wFs1jYuus3D4YACP3MPBSB56KoyeRVkcf3IaqayK+sZKSGoSyUwWPb21mB6VceetKrJZFQ53DlQSQZkHYAyc6n9QWfGybIQBcHtcyOcL8Hm9k//S5PKPQpmMytkgTcsj4PeAw4AsUVDZBc4pUpkEVKcHFRVdKOTyyMdi8LvrMRM5dO3+XY9dGfApWHPCmm8YTM2UcgXIdOqCFzY99hO9WFTDjT26ZsiOaGT47aFweFBxBX5dGQr1c84m9KKGdHZ6juDsl8jMATIXV7Gh50vQcyVIqvLvk5UhFLlcDqWCA06XFyAMllEMG4ZNGVPSAEp/Fmb4G/qtWhaD9BfJhaJYTH1HQOWwwL1PFXLJ5fsPbX28rXXB5xsaWm61LROiKEDXNHhClcilJiAoQQ67BKfHh3Rq/JJdO5+9vbN9xeV2Hvn9+zY8NBU71NvQ2HpQosFFleG6XwtiPjcV3XT9wcG+N3Z2nv+zcEXzgyMTu644sOvZWxubOz9VV7fwyxMTh1ZPT858GbDZggULz8kV0ods24JApbkFkgG2CcLiMJkOhyNwlJCZzSG5OOrCApJZGTaTjhKMIFBUVgbTh4wk9/o8hIgWOGwwC2jrdKJnmYi7vuNCPkOgOgyY9izOv8yGQ/XgmzeIKOYz6F6RxMrlHhx7QhF+n4if3FrCs4/4UUwHcMbFDC4PwZ3fJEjHnXCGx+FQVWjJTnBugkpxEHCwP4r1MW6CCgbq6itQyBeRSRHt/xS5HFlAVYcE1VFCYjYGEA8I8YJwHR6nALcnDIh55O2D4ESCy9OCXHoaeqmElBE/d+++zTfqtoX66l7MzE5/rlScXlFIRI+LRA+caFsEa0580/uqmlp/RwVqxqYjUUmUQSRAVR0oFvOwbeuIGzhXsKaDSBz1jS3QChyamYFDVqHltdfYfYeU61/Aj9bDCIIgUkqtI1bRP3pPb0IITMOAZWrg3ItiOrHq+a0P3asXZbWz84zzfZXBZ6lsvGTMtmUDGf6q0+4EBJl8AUHJUW6WxF9+HJwTP8AlXddxoP/gt9t62m9qrm39BiBhJhYDs0zYRgkAh66VwPUSBDvtmpo8/PnhwaH3d7Qt+WBjXfP92557+KHR6PNrm8LrN7a1Nr84MjF0hWUJh2aj8UsKbM/7WlrX/3xZ5ymXJeIHr92957FbuzuWfFWQG778wtYX3+Dw5r9b31z3dUVwfU+kAsquUDmzRwUCvVACt3SojrLO6s9XQQJKbAhIIhn3IZukoEdJVYllcrlJn9/R4PXLKKV1iJCwaKkHzzw5i0TBgihIIJYT57+zgK4eEz/8IkNFNcE578rD1mpg6hMIBF3Ys03AkxtFcFNFbWsR576zgOe3pLBrD3D8WTk0N3fA6UkjmdmFp+53wMhXA0LxD/OT2ABsgORRU+tALBtDQ3jpyH88uZStlCP+ug1JoqgMewCugzMTVCR/FDYlKIsLBFAiOk3TCEVnxo/PZpINheTssnjkybNMTLvaF6x9weHo+mo2W4xX+bwnRfbvONG2S1h23Fnfr25pvxVz8RBCCBjnEOaK6TnncLhcaG9vRTxRAhhBIhaBw6XC4/Ygky4glzMg+9WXD+T9pdQI11AsEIBzUCqQWDRySyyaXrVo4YqzwfksACiqCkVR/uHWiyAS5GYjbTuff/pXxeJU/cpjz/xqsDLwHHfpoAI76rISUJim/Rq/ADBNhnTOQtAXBF4SezrStIDA4w5foVsHNuY1z6db2ns+UxmsehKwAS6hWMxDIOViREGUIEmimEilT5wa3XELp8WqpUvXnBp0tDyzZ8uWX45OPnJGRWhxYdGq1R+RRcdud6r46Uhy2z1V4ephyX3GW3u7Fv86Hdv/8RdeuPsrNYHOH9sI3Z0uTP6kpr72QF3DstUuV2B2ZnIYoqRAEBWUSgo8bmsu3wfwv7KAcA4wDtTWi/B5KgEuAARQFJre8qz3kGXThs7OBrzw7EGoqh+K00Aub0JxyWhtN3HSaUkIlg+//Z6Gdes9cPgItm7wYmAfw9WfrITB4njgLhGa1gRJjmHdeUmIQgBP/tbGmRf7AZbFlodMJLOzWH+uGwuWevHCUxok6gJQwhEFPeMGgpUuVNW5sae/L3vsaufz/7HkciSuIooiJIVAL9pIp3LwV8hzL/ofCsyIIABEosVirjYWSR9n08JbE7mUUzcjuapA806HUDGUT+Y+m0ul1PqFx+5etOqsc7Ucj9hGtmfPtvv+K2Ok0NX7plsbm3quAzHnUsMWFJEimUzB6XUDoBBhg4DC4fVB0+RylP+PSPCIxfGaVbaEgtoJGMksPJ4GiCIlDmp7ika6GqYhE4LyCyV44HCo4Pz1bklY9rsZBzhoXSadPm7i4KPfycRnqpp7TnzcFH2/YgrlVODgRxmAwrZtaLnSa25kQilBOpcGJYDP7Tt6um2bEKVyfZUkyemm+p6PHzo4+MOuLmddsZg7kMsWIwFfAJZpQVJV2bLM7uH+/ouj0aGLSjzrDDa2397or/qCz1OJPbvvf2J4dMcpAXVZceGS8y7wVoR2lzIZNNQ3frHZoX/TqbbmS0YVotGRi3dsfeArIpfhdIYDoqKctnThyu85Hc4XDAvg3IbPG0Q+k4AoO5HLOOF2pUFfi3yAE1DRgiAnkImXXSpTFREKVj42MTVx2jHHN2Dr5gFopgv9/QW88cxqEG5AlNLY/VQFDKZh1Zku7N5p44W7CrAzHCef4sfadQru+nkJBw/Wg8pAhU/GiSfK2LExis6OHjCrgN/+hkMBAeUchZgHqhSArQ5DEDhESwYTdHBiw7ANdHQdC1vUoXp8z3nDzsR/HLlwzmGZJpwuF8K1QSiKDEEiKOXLpveR4OKRaljGuHdyYvSMbHb2Gk0ryFoOj7R3t/3YE6jcGY0PzvR0LcfAwee/NpnaoTa2LBxYfszZ54lEjWjFdOvubQ8+kk6M1LcveOMvu5eu+AihhBVzJXAOuDwSJAIU83lQWfoTS+oPAWhCCERJesWgJ6UCqCj9gYBe0SWhsM1ZcITg8YbYkvDS6yRlsdMomhEiCDDN4uvuApUtpjwkAbA54PJ6USiYNz3/zO8vpkxFc9dp98keb9wwyWmlonZAMWzL6XFw0wS4TaDli8imc6CUwmb2a7SQCLL5HFyiCyIttylIpzKQHSocLgmioMLvCzwuyh1nDw0Of8Aw2Le4Lc56PSotFXPNhBIPwJko8JHGlo7/CdZWb7Y4m/BQd3Dviw/fNTy45RRBrsSilad9NBSq38BhzS1KFBSVeT3lgp4fffOerQ/8FBxobDv2No+/4yveoDLqdARQzOdAbRHEI8Lp9iGfSYBz9jdXr3NG4HDZMDUHTF0C4QSLl9f/dsPDW244/fSVLn/gRZhFA3t2RjCw3wuJu5FJMaxcq+PY41247zd9mBlaBJFXo755EBdemceO7XE8fr8HRHSBsCwWrSjBoVTh8L4CGro1/OaeDCQpCGI5oaoqWhYYePKxQRCrGUTIlK1G2wWIaTBbwilnN6D/UByhcOie+GyJhxtc/znkYlkmnE4RHZ2dCFYEoDpVgLE/rIqEwDAs2JYI09QuiidiK0ulRKNuWn3BCsenl608bn88Mpt1uZxQPQ6EQ0HMjI2+Zef2jR+ramwZWX7cmW8SBXGslMv7D/VtujudGGnq6Fi5vWfRye8URNO0jRJmJ2fhCfrg8johShKoKEIQRQDlHiGWYcIwLco5GCEEJa104chI36Vrjj32HkmUfk2IZYJgbgtWilh08pJE3/Db2loWvpOZekJWPH9ORIRCFMW5FKANiwqQqZgVZSE7NTELh+qAKMkQBPGPSItCICIEwX55M4ZQACIkSToSvwEhdO4atNaySiXOpRQ4A6UmVIcAzsbPm57YdJLMgK5lJ325tXPJpwRFQD6nwdRyIKJNCZyKoRsliUpHyZ4fJXtxzmp76QJwpC3Fn/LPn94HQiiK+SIYZ/D7a2DZDIoi76+prr1iamrWIUhKIFRRUac2hDVJkbOz8fiU1+Oy3A4RCnHDzqSUA8OP/mZ04ImTVRpGe++pX66qqf9uOcMIqAqFKvtBHAGko6llu198/EeiYMvHrD3/I5XVLf9byhXh9HsAS4OpAy5ZBKgA8LIFbdkUto2XPAMCEaIkQbT5XNbqj9x0QYAkSRBFa46AObwVRUiKBEEA6kWMbHrasTufo2tPPL0FD96zGy7SgiLPgxUCaO4qYdkJwD13zCAxcywUgUAWYnjH+wiKRhE/vtmNgqaCKjYELY/mdglDhy2YZi0yxQwyyRBEiYIoh3DGmwOYGvFgasSEJBfALBVUKIFbThiGiPYeF7oXB3HPL6eSJ7yx+pF4ahJA1783uXDOYdsWOOdoa+9EY2MrVJcH4BZgs5eo0ASRIp8xpPGx6euYFb9UEJXbqqpCXy5pSEuKAUIoHC4HqERBiYREvP/i5178za9Cwfa+lctPPFNyeMctzRL69j/5o4nJZ1Y21S4eWLjsjPNslZq6psHIZyGKEkDgjM6MXhMZjfVqhu0o6sVMZSg4Wsxm/Qe2bz7FEWjbVtW46DqRcm7rhfNGhnad65KNc5mtfijcsOAqQZS2U4FCpsBMNnZa/4GtZ1Pbuq9gsmxltXy3KCk/P1J3QgUBzNQrJybGvj4bj6xqcDd9XxLxbcYpGBRQKoizscg5pp2/UHU5+zq7Al+hlMqJeOxNhpY8QzdMdHorPgfQKRwR8FEB3Cw2xeKRyyfGxzoM02wqFowDTbXur8xMz5zWP7bna76Kug2trcvfLlIwSCqZnhj41ODAY59jjAlLe877YnPP0s9EYxHYrICZmdhCwsULbcyuV1XfuENtvrm5uW5nuftFuaCwkM+fMJ2LvV1nOu/o9n8SXEzqmtYaKebeUcpFF0qi73sBf/ipP5YgvGIqfC7IKCsEJa3chwfgJVEUS7IiT0sSgSzLoITA63FDAlBKM2Vg4MWfD/dvPllBFTo7zv2fULj2CzYzoZc4ZJcIlVKAiEjNTp67c89vb9eoyzjuhMvOCITDG8A4nH5VzKdil09PTa8olLjhEESjpaM9yWGLQ4ODnVTxaBWV7R8ilOYppcsKxZySSsTXmGZ0CVcIr6l2fMMhu/eVu/ATmo7HrpyZmujVDCFfWVX3pMvl3ci4CcYBkbrBBMKPW9f1xSce6H/k/LctwZOP7YWVc0GQ0mBCFr1L3dj+3AySM24QUgQV0njHdVmEQnX4zpcySMTdoA4PGJmAwFW4fSamolPYv88HZbANRIihvsXEutP9yMQontoQB0EVwDVQsVAmSjEPs6jg4vccg317R9HSWvX9jsb2iKa/Pjos8Z9nqVhQFAX+imYEg7VQnc5yD0DbfHm3wTLropHJ/3W7/Vvd/qYVosRswyxXrEqSAsvIwalQUMWFbHJ63datG38eCFQfPnbFGy+UXZ5xakuIRPo/MDq05cKAv7q0ZM2Z77Dd/imLcEJBuCBI0PTEW/Y9/+JXND1bWxlourG1ufH3QOGDezb97qvpdAY242hdGL5RkgnPZlJBvZTWly3o+GQpn7hyYGh2uexuOsXry203OAWB4DFNI7tk8eIrdS36nrHhyNklXXRkMvmfV1YG4PO7kIlHl+/bu/UnY5MHFze3dOxt6qzfTJgJ0wYOHx54azE9+/GqoLB0YOAgTMioCtW5JyZiot8vnWUbxQWDA3sRDIYeFSX5XkV1gRDqnBjqu3zw4M7P5IrFmsb27gc7upf9OpOIXr9794MXpOOJkOqqnFy8pO1HHrfK0mmzd2iw74bx0effLMgUS5adfkt92/LPTEeHkI0VeyPJkZsSydE3Vtc0bAxWNHxaos7YbGTk1sa68Bm2admarvdk0vHPezxS2MpNrhweHXb4A76mdJpvV1TlNKdarBgaP9Bum8xWepSndDOPkmFCEP88MC0IwpzFZQPg8PoVIGMhl+NH5wDn5SipLIhoCoUhqiKYyar79m28cWJq85sFJYi21lO+Fqps/gLjReTTFrQiEPJWAVR0jhzc+469B7Z+W5Rz8qLVp57qdAY3sryNXCF67qHD274wOzW5yOtr+q0v2PQDbqdb97/46HfzhTziaR29S078cDiMPKXmokMHt23sPzAeCPgCj4pKtuPQrgNtvV3qdEtj1z7OsXDnjie+lZ4dO76iovZDRUPULJtd0trWtdG2TdgWQz4bArMl1ISdj0IYfSiT1c66/Io34JavPwoPJFDIcHhisMZzUKVKtCyM4ozzPSA8iJs/n0F0ohqSMweGHCh3g/AabHriME47swddK0bBTQurz87A76vAri0W9u9KQaReUKFQXtRtF4hgIK9HsPbEE9DdW4+7frEpefHbz72lqOVQlvL4//3IxWYM4ByNzY2oq6spxyQ4A2zrFXPQlmU6xyfGv1lXW/GT1va2h23GUMhnkExl4RCBUGUlipk0vB4fItGhs3a88PDvfM7mR1esOOEKqK6IBRncLNUe2v/UJ2S4sHzx2e9z+cMv5EwdDgucWXb4QP8Lt44M77jQH2gfWrDgxDWUYY/f58LsTMyaGj4Ib6iWHXv6Bdd6Aw2/iU5FFw8MHLpGFvU7wc11M5MTLd2dS55uaqn7jslGEE9KLdnZ7M3V1VU3paZz1szkyMqWxt6Jmtbe9wuEQFGB2UTsA6N9T/5PLhMNtLQfu3npsnUXMlOZLWQzvZMzw5/RLaVvYU/HRwb3P7M+FZv4hMtbSwYP9C9pbuu8DFyL79m//0aPw8VcTscwpRo4tyv37Hzh0cO7n19RU12rnbz+rHd5KpvvgG0hMjKxMBLZeVVNRZO++riz35DK0r7BsT3XWPGdN0Un+5wOyYOu7nO+2NjU9hlLBWLZyWsnDu+7mTGiHbNy1eWNnQt+buqUjY9luir8+UZC+ZLozPTJuXxudWdvh0lZ7q3bdx/aItusOT4zvb6pc5UgEetLO5/f8qFSIdZeV3v8tMvvgZ3LgekM9GhUmpeVzYSQ2dnY21PpxJLO7uafAMIBgMPjdcDhrEKwQkYiXoDbr8KyC5BEgJkiCvlc14E9T98zPbpnkdsVRufyUz4f8NR9lus2LI3DLJqgqgOp+PS6mcHnvz02uG+J5Ko21q57x2Vef2ijnrExNjn0qb69D35RclHes/T091TXH/djiTBMjW++ZP/BzZBVFWtPevN7q+vqv5tNjjVs3/70o9HIaKC95aSPNTa0fT2VG1tvG95z6kPV3yjm4yf2DWz4RSE7WLeg8YTxUtHNvV5lUVdn9xc4JMiyE4QwiDQH21AgihQXvq3nk7ffsvnkq99/kvPQwUPY+MgQXHCgb5uMU95QjxOOl6Eojdjx/Ai2PqXCMFRI7jSY5SqTBXOAOabRt8uDdGoGHT0OcCuJoZ0Khgez0DRAEmrBmQrI/SCWD5RVIm/E0dTagPd9Yi1+e882rFx+zIcbu2gUQul1K6QV/3+6QJwzuJxuVIdD8FUEAMsCN42/EnwUMT018CVF5luqqiofhiiAmAZyxQwMg0NRKERJhAagv2/Xp0fGp69rbV71cY8ncAsHNxgoCslRxKPD74ulYhVdLSfd7HJX/TifyaJUMMEtbemuA4/cOR0ZWtRYv+B7S1ce+1mXv3G2OBvB5OiBD/T1P3eRO1wfW7TspDdLimtz/+F974lMR1e01oW/lE3FLuw73P/FusbF316weMkNJVYsJJKzt2Sz1uKOrtVXZyITy8cmtv3I6ei+e8mKkz8RSZcmjFJpWS4ZuyUytuf4bDaO5s7Ve1cdd+ZpiXhMHx+IXmKx9DXNHXX3V4ZavtG//6EbDx967G0edxdraV55bbC++TaJWCdufPKRz5hM1Bd2r70qEGzcZbHMkt3Pbrx1oP/AitaersPLlh9/EePevVY+j9hU36cP7n/00lDVwtTi5SdcGs/l3NGJydsUqXBMJhd1cqHKbO9e/8nquo6bDMuUZg+/+PXhPVuudztrtnW2rXhbRaV/OB7Jwzbza4YPv/irupq6pp37N21QndXfWdq+7GKzlOl4bsOd38kzsbm6bvXt3d0LPu92iermx+7+eWI2ckz3gtNR23rc6UD6PfHZeAeRvI9KkvQ0OANjGkAl5HPZlXv3PfQzLV9Alf+ctCI6DqhuBYSWtzhVVRmWFSvriygBJBnpifGLd+55/KZ45mBdRXX3ns6Wkz7Q1NHxNCDC1AzEhgogRIRZKpw6MPD0/fHpPpfb0Tq7aPH6t5mW64l8RHKMT227qW/g8WvD1Q3bly0570pvZc9u25xGemrgwr59z3xbcYRLK1asvyRUVf+7RHzkwr1bHr8xVRT9a9ZecHZdU+tDsUgMgPpkc23rk0Y+ddGBwU0/yhVnPIFAVyJvVT0YrPAfaunt+F4up3UnM+mLwtU193BOuOrSIfnLhYq+Cnnv2hM73/vDH//qJ+//8FWYGrkbA4cOo/+wgqkpDU5nDtmkAL1UC0GSIChFMGaW9y/iBCAmCHeDCCYmRzjGBgSASxCIF6JIoMizANfKv2sHwbkCjc3A6S/h01+8Hs9teRGqw3HXiet77xCd07TcBJj8+7lFixeuRCAQgCAIsIqvTgRIbY5kIrGqd0HPt3TdQm5sCu6gjVIpD0rdoAIVYtGZ8ybGRz6sUFpcsWLd2ZxJLxSNBJhFgDxHIW5ifGTixIpQVaF7ydIvpxM5yIwjny+efnD42QemI2NKV9eaX7a2HHNtIpkHnNm2gcF9Nw317zjPE/AXVx974RnjE8nYoZFnnpIcnkN1tTXXFUrDpwwMDnyzsX7JrVWNPdcdnoxWzUylr68M+Ysrli++RCsUztuzb9N3qkMN293BlvcMjERoIp05q7429FZBsKK5zDSaW46LHrP2zXuLpdmvDw/3r+Jw9Hd2917sr3BMDw9u/tqevc991OtvL61cccElgZrmewxJC77wyF13UBbznLT+rIN+d9Mv+/cOvSOa2vOt2NS+YPeC5X2Lj33TxfmkuT+XnK2LRQ/cMjT49AWBiiCWrVr/+3iaTMZjkf8KVzpumhkfvCybyy5duvqcjU0ty2+KRpPLJw/vu3lmfMsJfm/Nru5F688M14eTBS2BQ3uHzpFhX9rW0v3rdNbc1r140Xa3OziWmU0c+/zmhx4wuBXqXbb++8HKpdeoihMH92z6XTIROWbh4uXoPWY94tHZhcNDO39kMPOetq66w5IkQaR0rohTAKEiA7HQ3t6eCflDD8M0AKK+JMdNCIUkKShl0kv2HH78K2MDu98oiA4sWXrez2pbVn88n5ydhm0CggQtn4Gg2hBEgJqWrmkpp+Jy6itXnXgllyqe2D9w6AwzN/TddGq4tbqm4/llK9afamuBQjpzwB+b2XdT/+79lzKhKB9/8lk/cqntj+3dtfcrY5PPf1wo5rFmzdlXSUrlQ8ND49CsAgrpzHFGbvIHycToQmZbWH3Mm3/g8tV8UpQ9SafDoRw80P+JQlHvrW1o/IEgCJzNJSmYTQDCYZoCTnnjkjtiqZkl99x3/we+dPPZ+OQHcjh0cBooBlHMekGlJERnHpyLc3VZpGztH0mJk7K7I0giBAll15KXQDgHsf1gxAIXUgABijqHJ8DxyRsuw/TMDCYnZ7dde/07roGjCHAwfkR1Tf5NyIXZNvx+P6qq68AZA2Mc9FVKBaggwulw7Z4cm363KLp+XNQKmuBwVBuGHioVzKV2gnWAl2hLa+Pt4ZquO4vplJmJZ2HbDPmkBpFS+D0NYExxtzU35ARRjadS052aMX1tUTPrGzo6v5o18p9t6Wh+irNS99hY9ITJ6NTpeibXYYsi2nu6rcjs2OXZnO3s6u69M1xbebdtuMytW/dcxUXXflGu/uLg0NT5nqBw9cLF7fc7Vf/HRdGJsannLrWEZNHjPeXyvMZPM1l2QU1taFtnT9d/PfnInqsc3qoLGztaf//CC1sGtGL+/OaWutsbG7t/aFnAUP+O6/dt/83H/IGOfO/CM872+is2MVFDIjb6lmR0uHnRsh5Qhp4D+/Y/IBLn1u7uRZ/PFUe+2di5YM9Ef/JwZGLiPdlC3+dzyZ21LocDVbVLc5kc+7imGeM1NeH35lITldFU7iMN7V3wh4In9h3YuzGbKfX39rTdrukjqy2j4o5CieeHRg5fmEhEPuZyB3eG/VVXVVcHUkMjEUh2ALlIdtnzz9//aFqL+9asfdMtLa3Lr9dKJjS94B8cH1oXrmtBTdNC7N3zvGno5j2Eqt+oq6nZQWl5Z0JKAAgmbG7C5XPuWrT4pFtyqeyFBUNU3R6pjTNmEgFgzBYMw3CXtGL3nr3PnRObGblUYCRd29R5Z0fPMb/yeasfLeoC2JxbzWwbouKAr0qFKEoYHzu8JpkpkLVr12QsyrcNDR3+kMfvPibc2DOzd2eyddHC5bepsqrsO7BrVd6Y/h/LSp2UN0tYtmRJKlsobuk/vP2OQNC3ta2997e56ckT3C73Lw8M9vsF2dHFqX6xrNA3tzS2/3jXjlK1Uw15W9qPuTmTS/rHpg+/t1Rga0Xm+U1zc+vXVafTZC/b54fANAnOPfeNH/z5z3/peeiRDe/5+vcux02f34hNT+6AyxUHt+vKmVMhXS6+5UfaYgplIhH0cu0mhDniKeutOOHgjIFzJ2zDgZIVRVu3C5/+wuUYmxzFli19A1e+96K3yrKULu/s+PpC+NznPvc3nTg9MQJZlqEoCgqFAorFshybMRuUCFAdMiS5rAAUZQckQURFZQU4Y69RGc/hVF3PGrrVE08kT9I17UQb5rtE0SVxmw021Xf8RJYdvwxUOHdJspfpxQKMkg5REWDDgE1LMEkBTrczlErlFqXjrNEwtbdXVQdpU1Pz20RBfEq3ZCGbzVyYTmvHqLKvP1zV9MWGut7fljRrgSAL3BcI7Ar4q/47GPDsFGXBhK2gUCRSMllqqAgH31JVFd5aWRX+Rn1t3VanU2KECLBspukl1qSqlZLs9B4SJeUep0sZDgYrLNuSfIUi72AiFWRV3aRIvg9W1wR2yoofmVy+c3ig7/N+sWps0aqTrwzXtT5NBA4ictiWlTeKdAEjwenZeO7mqprWr3tdvgdCNaFtJpc9sxGtUy+YN1jWwKXx+FaPCAn+wLIRl7/9v6kobbZtZtuWAUPXmKwGwow4WD6Pu3WD3x6urr61rrF+D6XyYLHE15UM/Q2Wxapqaqpu72xf8K1cJqu5nApksR62ptDR4b4PmVaia+Hytbc0Nnd9jFIRnMgQZJHZltZjGoQUdekHbp/rY23t7d/J5YozglhWGhNKIFACWZrrccMZD4WbH7VMbBwamOg17MKHI9GZd83Oxt45MzN9SSQycwFjxpkOh9DQ1Nj2ue6OY69WROUXvqBvEBBhWhRaIQtf0AvdACyDgHMBnAswTS6UNLYYxGOZprovXF2/sbG56ScVvsafMsMjx5KT752djbxDlFyepsbOr7W1Lrg3ndOOJYJvPJ/R+urq2/63obH5SUUR96ZTidOyBXMJqGNhOpsp9fb0Pt7S2nWTw1H1MGHh3YVS7u3R6MRbk+nMasUljje0NN7okHxPcJsxUZIgSuJLxIRlA0QCs1QUChpaO+ofmBrXHU8/+fzx13/yBLjdTuzenkXJikIQGagdAIECwo9or0yAWnMkIwNcBrh0tByBg4NRhpJRgMV1nHH2Snz8s+fjmee2YnRiYvOFF519lqrKk7IigYomRFU/arKIxPP366n+1pqV7c9thMvlgsfjQTQaRTyeAIcN09IhEAn+oAsOFwWzLThcQQicoqunE8x+jZJxApTyRVAqYmhwGJwzLDpmITENxseGhlFV2YBEMopQjQK3tw75ZAKZeAahpirIih9/aIVAkJidrknPGryxpSYmOSQGMKRTs4gnsmhvb4OhaZgai6OqrgqUUpi6Bm9AIYDC85kCgALcPgds3YmxsSgYNLR3tpzJuf6obhhMUcpbYXJIMHUbiiICEAmzLR6PJ1Eo5NHc2IR8Rkcxn4K32gvLtDF4aALNrUF4vPUoapoksJLgsmStJBXh8ATALQu2YIBCArVkgFIcOrAT4XAtuKVDN0X4gxWAbSzPpAZf2LX9AYFKotlYu+bGULD1ZktyJIp6BppugcBGKZ9AVbgVVbWViMwkkEpl4PZ40dZRg1KhCMnhUjgDyadLGuNpeD0hRCemUR0OoFgIwdAtWNaMXFUD1ZJcWcZtqLIbhiWAEEASbeRn4ySRMbnsIPB6/BgeHofDLcLjD4AKFLJI4XZIR4OHouTEzMQUIhMZLDuuF9lMwlUs5lVRpNztcRqq6tAApwVQFFJpJKKjqKqvgSR6UTIkpKITaGirQ6lEUSpYIHOpcsMwQIguul1Orshuu1gsgMkcLlGCmSdIFA7Vun2K7ZDrorlcHhXhamRTcZVQyZwYHbEDgWoEghVQHRY4J/5CtqgUSyy2t28fX33sCni8TnBmAaBgvHSjZWoHbEv6JRcEQ1ZlGAUbhUwJkqxCcSgv0cmAcDDTAUvzIZspIZNPorqyFg/cu+WKA/un//fCt67wOpwqfvqjB7HtmUMwsn7IsgpBEEGIDVANhDBw2zlHMOWWIpxoYKwI3SZg4Fi8Iox3XLEaDa0h3H3Hi/D5q2+97Jq1H4tHckVRpPBXuiBIRSjeLI64RQqt+feKufx9ehj7qEIWsPlLP7+cK8bAmf0SNa3T5ZvJJZNz2omy0E0QHGAsBeAP7Rw45+BgYMwCIHBAmJP4H6msKXcdC1b4AZgPEwLIsoxyw6IjY7aPfAWngoCqcAhTk8Zciwi7fNgWjrTO4Lxs1UqqYBLqNnVCQaHALOdpy/0+OIFtGTAtC+4KFxhhoMRuT8VTx87ORE7K5vovnJnYI4QqWmKdPaveoTqcj5tFE/xlUr9Hx/AS7QmB4vKAATqOaJD+rPfM0ftt2LZl2NQqB1lfcnELjNm8fG3hNT3nIy02CCEFSmnhSJ0W5zYIMcC5+Ffrtgj5w1HefcKyAAbbMueePZnLXFoghEwTkKPzqzwPbI0SOnfuXGKLKiCEpFWVo1DMvaSYtGwo2BBAPyYIKgxTgCAplADU4RYt1S3/mULbtjjYn6suUCxqaGtv/pFp0Wcfe2TP54Mh8pZ3XX0OLrv0dGx5Zje2PHMYEyMp6JowJ+pjILyI8hwlADXgcJmoqXdiyYqVWHtqMxpbgnh+635senpgV2ND/UdPfuOCjd7KBJzBI1qyEgh4uXnU67i9zf+pHRdfqW/M31MD9dL6olf85r9IhIQQEMUFTjioSAGAMDAKEJuBQ+AEgi2XK7FZAblCDrZlnTkS2fdWrpOAR/L9rjYUnJqZiPurazpfXLHk5Cs1U99jWQaA11bsWN4xcH4bgpedJ/yvVaeXC20FSQKDTefeL+uIcJn9cYBaAoj98q1qDcOEy6UeWr2266JUMn/hT29/6t1NLeJpCxYtkNa/YRVKOYJINIOZqVlkcymUDA2K5IDL5UY4HEBDUwVUj4VMXkNf3zgee2zvbkWSbl28rOUXbmdFSfFlQOAihB4ZEP97X4V5cvlXxp+U7fO5kD8IB0T7DyTEbFY7OTn2Pq3EVG+lcN+CZcsezebzS17c+NTnqkPdG7qWH/cO0dZm89r0PEf802iIY86Mtf7Wd5YxDsu0UFERvPfE0xfeG/T7F7347L7Lnty0dbXf71nl9jjkusZG0uiogigRWBaFaVDEZ+N44ul9VjaTPawz87mGxvpfLVxRvSkbI9y2GSzLBmfyP4BK5snl34dsUO4IZ5UYLDAQQqHrhZqhg7u/bpjWnZWVtY+5PRpmI5GmPX2bHqmorfndws5VV0MSDGay+Rv4b29llw9Dt6BbDL4m3772rvqPVmV9iEWzDal0IeDwaCcMvLjfl8uPwOlyoKmxQauoaHwyHhGS608+NTIa26M7XW5wpsG2bfz/bgY/Ty7/wsgkM9AK2tFtamPRyCUet+9Oi5UeK2qTEGXporGZ7EfCgSUfClU5f2ozC5RJ8zfu34pEyosIYwS2Xda/WCaHKFJQClSEJAgK0NxlobqhAoVsCL/+2YsTbo97oq6ham86HYfscMDtdqG61oNQZQCSlIfNzDkrheP12Shknlz+Y6wW07KQy+TL2bUj2+CCiKm0tsxCotG2jWMty1HsXbDkKqOEXZoemb9x/3auMIEkG5CkHATFgitIIYslLFBkBELVECUG1TGnaYENt1dFZbWIi9/Tg+lxGzPT2lwSouxG2TaHbf/rWK3z5PKv6rMzIFQZPhokppTCoTq/Pa1PrG1qXhbw+5xfj85MHRIECvtlij3n8a8NARRUIUdDM7ITcIMC0OEJSHMhERFH668AsayOs6yG5hBraKbY9mwEQ4P/wuTJ57f7m8c85vEPAJ2/BfOYxzzmyWUe85jHPLnMYx7zmCeXecxjHvOYJ5d5zGMe8+Qyj3nMY55c5jGPecxjnlzmMY95/Bvg/w0Az6gmOMAINdQAAAAASUVORK5CYII=';

const pad = (value) => String(value).padStart(2, "0");

function toShortDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getMonth() + 1}.${pad(date.getDate())}`;
}

function toDotDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}

function toInputDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getDefaultDates(today = new Date()) {
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const daysSinceMonday = (base.getDay() + 6) % 7;
  const lastMonday = new Date(base);
  lastMonday.setDate(base.getDate() - daysSinceMonday - 7);
  const lastFriday = new Date(lastMonday);
  lastFriday.setDate(lastMonday.getDate() + 4);

  return {
    startDate: toInputDate(lastMonday),
    endDate: toInputDate(lastFriday),
    writtenDate: toInputDate(base)
  };
}

function weekdayRange(start, end) {
  const dates = [];
  const current = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);
  if (Number.isNaN(current.getTime()) || Number.isNaN(last.getTime())) return dates;
  if (current > last) return dates;

  while (current <= last) {
    dates.push(toInputDate(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function emptyPhotoSlots() {
  return Array.from({ length: 6 }, () => "");
}

function getReportDates() {
  return weekdayRange($("#startDate").value, $("#endDate").value);
}

function initializeBlankReport() {
  state.rows = [];
  state.photoDays = getReportDates()
    .map((date) => ({ date, photos: emptyPhotoSlots() }));
  ensureRowsForEveryDate();
  renumberAllNotes();
}

function makePhotoNote(index) {
  const first = index * 2 + 1;
  return `사진${first},${first + 1}`;
}

function makeEmptyRow(date, note = "사진1,2") {
  return {
    date,
    place: "",
    detail: "",
    note
  };
}

function addRowForDate(date) {
  const dateRows = state.rows.filter((row) => row.date === date);
  state.rows.push({
    ...makeEmptyRow(date, makePhotoNote(dateRows.length))
  });
  renumberNotesForDate(date);
  renderAll();
}

function addPhotoDay(date = "") {
  const dates = getReportDates();
  state.photoDays.push({ date: date || dates[state.photoDays.length] || dates[0] || "", photos: emptyPhotoSlots() });
  renderAll();
}

function updateRow(index, key, value) {
  state.rows[index][key] = value;
  if (key !== "note") renumberAllNotes();
  renderPreview();
}

function updatePhotoDay(index, value) {
  state.photoDays[index].date = value;
  renderPreview();
}

function removeRow(index) {
  const date = state.rows[index]?.date;
  state.rows.splice(index, 1);
  if (date) renumberNotesForDate(date);
  renderAll();
}

function removePhotoDay(index) {
  state.photoDays.splice(index, 1);
  renderAll();
}

function ensureRowsForEveryDate() {
  getReportDates().forEach((date) => {
    if (!state.rows.some((row) => row.date === date)) {
      state.rows.push(makeEmptyRow(date));
    }
  });
}

function renumberNotesForDate(date) {
  state.rows
    .filter((row) => row.date === date)
    .forEach((row, index) => {
      row.note = makePhotoNote(index);
    });
}

function renumberAllNotes() {
  getReportDates().forEach(renumberNotesForDate);
}

function syncRowsToDateRange() {
  const dates = getReportDates();
  if (!dates.length) return;

  const oldDates = [...new Set(state.rows.map((row) => row.date).filter(Boolean))];
  state.rows.forEach((row) => {
    if (dates.includes(row.date)) return;
    const oldIndex = oldDates.indexOf(row.date);
    row.date = dates[Math.min(Math.max(oldIndex, 0), dates.length - 1)];
  });
  ensureRowsForEveryDate();
  renumberAllNotes();
}

function syncPhotoDaysToDateRange() {
  const dates = getReportDates();
  if (!dates.length) return;

  const byDate = new Map(state.photoDays.map((day) => [day.date, day.photos]));
  state.photoDays = dates.map((date, index) => ({
    date,
    photos: byDate.get(date) || state.photoDays[index]?.photos || emptyPhotoSlots()
  }));
}

function syncDateRange() {
  syncRowsToDateRange();
  syncPhotoDaysToDateRange();
  renderAll();
}

function readPhoto(file, dayIndex, photoIndex) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.photoDays[dayIndex].photos[photoIndex] = reader.result;
    renderAll();
  };
  reader.readAsDataURL(file);
}

function renderRows() {
  const host = $("#workRows");
  host.innerHTML = "";
  getReportDates().forEach((date) => {
    const dayRows = state.rows
      .map((row, index) => ({ row, index }))
      .filter((item) => item.row.date === date);

    const group = document.createElement("section");
    group.className = "work-day";
    group.innerHTML = `
      <div class="work-day-head">
        <div class="work-day-title">
          <strong>${toShortDate(date)}</strong>
          <span>${toDotDate(date)}</span>
        </div>
        <button type="button" class="small">이 날짜에 추가</button>
      </div>
      <div class="work-day-rows"></div>
    `;

    group.querySelector("button").addEventListener("click", () => addRowForDate(date));
    const rowsHost = group.querySelector(".work-day-rows");
    dayRows.forEach(({ row, index }) => {
      const item = document.createElement("div");
      item.className = "work-row";
      item.innerHTML = `
        <label>장소<input value="${escapeAttr(row.place)}" autocomplete="off"></label>
        <label>세부내역<textarea>${escapeHtml(row.detail)}</textarea></label>
        <label>비고<input value="${escapeAttr(row.note)}" readonly></label>
        <button type="button" class="icon" title="삭제">X</button>
      `;
      const controls = item.querySelectorAll("input, textarea, button");
      controls[0].addEventListener("input", (event) => updateRow(index, "place", event.target.value));
      controls[1].addEventListener("input", (event) => updateRow(index, "detail", event.target.value));
      controls[2].addEventListener("input", (event) => updateRow(index, "note", event.target.value));
      controls[3].addEventListener("click", () => removeRow(index));
      rowsHost.appendChild(item);
    });
    host.appendChild(group);
  });
}

function renderPhotoDays() {
  const host = $("#photoDays");
  host.innerHTML = "";
  state.photoDays.forEach((day, dayIndex) => {
    const card = document.createElement("div");
    card.className = "photo-day";
    card.innerHTML = `
      <div class="photo-day-head">
        <label>사진 날짜<input type="date" value="${day.date}"></label>
        <button type="button" class="icon" title="삭제">X</button>
      </div>
      <div class="photo-grid-editor"></div>
    `;
    const dateInput = card.querySelector("input");
    const deleteButton = card.querySelector("button");
    dateInput.addEventListener("input", (event) => updatePhotoDay(dayIndex, event.target.value));
    deleteButton.addEventListener("click", () => removePhotoDay(dayIndex));

    const grid = card.querySelector(".photo-grid-editor");
    day.photos.forEach((photo, photoIndex) => {
      const slot = document.createElement("label");
      slot.className = "photo-slot";
      slot.innerHTML = photo
        ? `<img src="${photo}" alt="사진${photoIndex + 1}"><input type="file" accept="image/*">`
        : `<span class="slot-label">사진${photoIndex + 1}</span><input type="file" accept="image/*">`;
      slot.querySelector("input").addEventListener("change", (event) => {
        readPhoto(event.target.files[0], dayIndex, photoIndex);
      });
      grid.appendChild(slot);
    });
    host.appendChild(card);
  });
}

function renderPreview() {
  const department = $("#department").value;
  const startDate = $("#startDate").value;
  const endDate = $("#endDate").value;
  const writtenDate = $("#writtenDate").value;

  const pages = [renderCoverPage(department, startDate, endDate, writtenDate)];
  state.photoDays.forEach((day) => pages.push(renderPhotoPage(day)));
  $("#reportPreview").innerHTML = pages.join("");
}

function renderCoverPage(department, startDate, endDate, writtenDate) {
  const dates = getReportDates();
  renumberAllNotes();
  const reportRows = state.rows
    .filter((row) => dates.includes(row.date))
    .sort((a, b) => dates.indexOf(a.date) - dates.indexOf(b.date));

  const rows = reportRows.map((row, index, list) => {
    const previousDate = list[index - 1]?.date;
    const dateText = row.date === previousDate ? "" : toShortDate(row.date);
    return `
      <tr>
        <td class="date">${dateText}</td>
        <td class="place">${escapeHtml(row.place)}</td>
        <td>${escapeHtml(row.detail)}</td>
        <td class="note">${escapeHtml(row.note)}</td>
      </tr>
    `;
  }).join("");

  const blankCount = Math.max(8, 24 - state.rows.length);
  const blanks = Array.from({ length: blankCount }, () => `
    <tr class="blank-row"><td></td><td></td><td></td><td></td></tr>
  `).join("");

  return `
    <article class="page">
      <header class="report-header">
        <div class="report-title">주간업무보고서</div>
        <div class="report-meta">
          <div><b>부서명:</b> ${escapeHtml(department)}</div>
          <div><b>작업 일자 :</b> ${toDotDate(startDate)} - ${toDotDate(endDate)}</div>
          <div><b>작성 일자 :</b> ${toDotDate(writtenDate)}</div>
        </div>
      </header>
      <table class="work-table">
        <thead>
          <tr>
            <th class="date">날짜</th>
            <th class="place">장소</th>
            <th>세부내역</th>
            <th class="note">비고</th>
          </tr>
        </thead>
        <tbody>${rows}${blanks}</tbody>
      </table>
      ${brandMark()}
    </article>
  `;
}

function renderPhotoPage(day) {
  const cells = day.photos.map((photo, index) => `
    <div class="photo-cell">
      ${photo ? `<img src="${photo}" alt="사진${index + 1}">` : `<div class="photo-placeholder"></div>`}
      <div class="photo-caption">사진${index + 1}</div>
    </div>
  `).join("");

  return `
    <article class="page">
      <h2 class="photo-title">${toShortDate(day.date)}일 작업사진</h2>
      <div class="photo-grid-preview">${cells}</div>
      ${brandMark()}
    </article>
  `;
}

function brandMark() {
  return `<div class="brand-mark"><img src="${LOGO_DATA_URL}" alt="Harrington Place"></div>`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll('"', "&quot;");
}

function renderAll() {
  renderRows();
  renderPhotoDays();
  renderPreview();
}

function getFileBaseName() {
  const start = $("#startDate").value.replaceAll("-", "");
  const end = $("#endDate").value.replaceAll("-", "");
  return `주간업무보고서_${start}_${end}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function imageToDataUrl(img) {
  if (!img.src || img.src.startsWith("data:")) return img.src;

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const context = canvas.getContext("2d");
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

async function clonePageForExport(page) {
  const clone = page.cloneNode(true);
  clone.style.margin = "0";
  clone.style.boxShadow = "none";

  const originalImages = [...page.querySelectorAll("img")];
  const clonedImages = [...clone.querySelectorAll("img")];
  for (let i = 0; i < clonedImages.length; i += 1) {
    try {
      clonedImages[i].src = await imageToDataUrl(originalImages[i]);
    } catch {
      clonedImages[i].removeAttribute("src");
    }
  }
  return clone;
}

async function pageToCanvas(page, scale = 2) {
  const rect = page.getBoundingClientRect();
  const clone = await clonePageForExport(page);
  const css = [...document.styleSheets]
    .map((sheet) => {
      try {
        return [...sheet.cssRules].map((rule) => rule.cssText).join("\n");
      } catch {
        return "";
      }
    })
    .join("\n");

  const html = `
    <style>${css}</style>
    <div xmlns="http://www.w3.org/1999/xhtml">${clone.outerHTML}</div>
  `;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${rect.width * scale}" height="${rect.height * scale}" viewBox="0 0 ${rect.width} ${rect.height}">
      <foreignObject width="100%" height="100%">${html}</foreignObject>
    </svg>
  `;

  const image = new Image();
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(rect.width * scale);
  canvas.height = Math.round(rect.height * scale);
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);
  return canvas;
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function dataUrlToBytes(dataUrl) {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function latin1(bytes) {
  let text = "";
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    text += String.fromCharCode(...bytes.slice(i, i + chunk));
  }
  return text;
}

function buildPdfFromJpegs(jpegs, pageWidth, pageHeight) {
  const objects = [];
  const addObject = (body) => {
    objects.push(body);
    return objects.length;
  };

  const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
  const pagesId = addObject("");
  const pageIds = [];

  jpegs.forEach((jpeg) => {
    const imageId = addObject(`<< /Type /XObject /Subtype /Image /Width ${jpeg.width} /Height ${jpeg.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.bytes.length} >>\nstream\n${latin1(jpeg.bytes)}\nendstream`);
    const content = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im0 Do\nQ`;
    const contentId = addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  });

  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i += 1) {
    bytes[i] = pdf.charCodeAt(i) & 0xff;
  }
  return new Blob([bytes], { type: "application/pdf" });
}

async function exportJpg() {
  const canvases = await generateReportCanvases(2);
  for (let i = 0; i < canvases.length; i += 1) {
    const canvas = canvases[i];
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.92);
    downloadBlob(blob, `${getFileBaseName()}_${pad(i + 1)}.jpg`);
  }
}

async function exportPdf() {
  const canvases = await generateReportCanvases(2);
  const jpegs = [];
  for (const canvas of canvases) {
    jpegs.push({
      bytes: dataUrlToBytes(canvas.toDataURL("image/jpeg", 0.92)),
      width: canvas.width,
      height: canvas.height
    });
  }
  const pdf = buildPdfFromJpegs(jpegs, 595.28, 841.89);
  downloadBlob(pdf, `${getFileBaseName()}.pdf`);
}

function createExportCanvas(scale) {
  const canvas = document.createElement("canvas");
  canvas.width = 794 * scale;
  canvas.height = 1123 * scale;
  const context = canvas.getContext("2d");
  context.scale(scale, scale);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, 794, 1123);
  context.fillStyle = "#111";
  context.strokeStyle = "#111";
  context.lineWidth = 1;
  context.textBaseline = "alphabetic";
  return { canvas, context };
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function getLogoImage() {
  const logo = document.querySelector(".brand-mark img");
  if (!logo) return null;
  try {
    return await loadImage(LOGO_DATA_URL);
  } catch {
    return null;
  }
}

function drawLogo(context, logo) {
  if (logo) {
    context.drawImage(logo, 526, 1048, 210, 43);
  }
}

function drawLine(context, x1, y1, x2, y2, dotted = false) {
  context.save();
  context.setLineDash(dotted ? [1.2, 2.2] : []);
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();
  context.restore();
}

function drawCenteredText(context, text, x, y, width) {
  context.textAlign = "center";
  context.fillText(text, x + width / 2, y);
  context.textAlign = "left";
}

function drawCenteredMiddleText(context, text, x, y, width) {
  context.save();
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, x + width / 2, y);
  context.restore();
}

function wrapText(context, text, maxWidth) {
  const words = String(text || "").split(/\s+/);
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (context.measureText(test).width <= maxWidth) {
      line = test;
      return;
    }
    if (line) lines.push(line);
    line = word;
  });
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function drawWrappedText(context, text, x, y, maxWidth, lineHeight, maxLines = 2) {
  const lines = wrapText(context, text, maxWidth).slice(0, maxLines);
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
}

function getReportRowsForExport() {
  const dates = getReportDates();
  renumberAllNotes();
  return state.rows
    .filter((row) => dates.includes(row.date))
    .sort((a, b) => dates.indexOf(a.date) - dates.indexOf(b.date));
}

async function generateReportCanvases(scale = 2) {
  const logo = await getLogoImage();
  const canvases = [drawCoverCanvas(scale, logo)];
  for (const day of state.photoDays) {
    canvases.push(await drawPhotoCanvas(day, scale, logo));
  }
  return canvases;
}

function drawCoverCanvas(scale, logo) {
  const { canvas, context } = createExportCanvas(scale);
  const department = $("#department").value;
  const startDate = $("#startDate").value;
  const endDate = $("#endDate").value;
  const writtenDate = $("#writtenDate").value;
  const rows = getReportRowsForExport();

  context.font = "900 34px Malgun Gothic, Arial";
  context.fillText("주간업무보고서", 54, 106);

  context.font = "13px Malgun Gothic, Arial";
  context.fillText(`부서명: ${department}`, 520, 77);
  context.fillText(`작업 일자 : ${toDotDate(startDate)} - ${toDotDate(endDate)}`, 520, 99);
  context.fillText(`작성 일자 : ${toDotDate(writtenDate)}`, 520, 121);
  drawLine(context, 54, 152, 740, 152, false);

  const x = [54, 130, 256, 630, 740];
  const headerY = 171;
  const rowHeight = 34;
  context.font = "900 13px Malgun Gothic, Arial";
  drawCenteredMiddleText(context, "날짜", x[0], headerY, x[1] - x[0]);
  drawCenteredMiddleText(context, "장소", x[1], headerY, x[2] - x[1]);
  drawCenteredMiddleText(context, "세부내역", x[2], headerY, x[3] - x[2]);
  drawCenteredMiddleText(context, "비고", x[3], headerY, x[4] - x[3]);

  for (let i = 1; i < x.length - 1; i += 1) {
    drawLine(context, x[i], 152, x[i], 1016, true);
  }
  drawLine(context, 54, 190, 740, 190, true);

  const exportRows = [...rows];
  while (exportRows.length < 24) exportRows.push({ date: "", place: "", detail: "", note: "" });

  context.font = "13px Malgun Gothic, Arial";
  exportRows.slice(0, 24).forEach((row, index, list) => {
    const top = 190 + index * rowHeight;
    const base = top + 23;
    const previousDate = list[index - 1]?.date;
    const dateText = row.date && row.date !== previousDate ? toShortDate(row.date) : "";
    drawCenteredText(context, dateText, x[0], base, x[1] - x[0]);
    drawCenteredText(context, row.place, x[1], base, x[2] - x[1]);
    drawWrappedText(context, row.detail, x[2] + 10, base, x[3] - x[2] - 20, 15, 2);
    drawCenteredText(context, row.note, x[3], base, x[4] - x[3]);
    drawLine(context, 54, top + rowHeight, 740, top + rowHeight, true);
  });

  drawLogo(context, logo);
  return canvas;
}

function drawImageCover(context, image, x, y, width, height) {
  const ratio = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * ratio;
  const drawHeight = image.height * ratio;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;
  context.save();
  context.beginPath();
  context.rect(x, y, width, height);
  context.clip();
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  context.restore();
}

async function drawPhotoCanvas(day, scale, logo) {
  const { canvas, context } = createExportCanvas(scale);
  context.font = "900 20px Malgun Gothic, Arial";
  context.textAlign = "center";
  context.fillText(`${toShortDate(day.date)}일 작업사진`, 397, 82);
  context.textAlign = "left";

  const startX = 80;
  const startY = 102;
  const cellW = 317;
  const cellH = 307;
  const captionH = 28;
  context.strokeStyle = "#111";
  context.strokeRect(startX, startY, cellW * 2, cellH * 3);

  for (let index = 0; index < 6; index += 1) {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = startX + col * cellW;
    const y = startY + row * cellH;
    if (col === 1) drawLine(context, x, y, x, y + cellH, false);
    if (row > 0) drawLine(context, startX, y, startX + cellW * 2, y, false);

    context.fillStyle = "#f5f5f5";
    context.fillRect(x + 1, y + 1, cellW - 2, cellH - captionH - 1);
    if (day.photos[index]) {
      try {
        const image = await loadImage(day.photos[index]);
        drawImageCover(context, image, x + 1, y + 1, cellW - 2, cellH - captionH - 1);
      } catch {
        context.fillStyle = "#f5f5f5";
      }
    }

    context.fillStyle = "#fff";
    context.fillRect(x + 1, y + cellH - captionH, cellW - 2, captionH - 1);
    drawLine(context, x, y + cellH - captionH, x + cellW, y + cellH - captionH, false);
    context.fillStyle = "#111";
    context.font = "900 14px Malgun Gothic, Arial";
    drawCenteredText(context, `사진${index + 1}`, x, y + cellH - 9, cellW);
  }

  drawLogo(context, logo);
  return canvas;
}

async function runExport(button, task) {
  const label = button.textContent;
  button.disabled = true;
  button.textContent = "저장 중...";
  try {
    await task();
  } catch (error) {
    console.error(error);
    alert("저장 중 문제가 생겼습니다. 인쇄 기능으로 PDF 저장을 진행해 주세요.");
  } finally {
    button.disabled = false;
    button.textContent = label;
  }
}

function bindEvents() {
  ["department", "writtenDate"].forEach((id) => {
    $(`#${id}`).addEventListener("input", renderPreview);
  });
  ["startDate", "endDate"].forEach((id) => {
    $(`#${id}`).addEventListener("input", syncDateRange);
  });
  $("#addPhotoDayBtn").addEventListener("click", () => addPhotoDay());
  $("#printBtn").addEventListener("click", () => window.print());
  $("#pdfBtn").addEventListener("click", (event) => runExport(event.currentTarget, exportPdf));
  $("#jpgBtn").addEventListener("click", (event) => runExport(event.currentTarget, exportJpg));
}

function initializeDates() {
  const defaults = getDefaultDates();
  $("#startDate").value = defaults.startDate;
  $("#endDate").value = defaults.endDate;
  $("#writtenDate").value = defaults.writtenDate;
}

initializeDates();
bindEvents();
initializeBlankReport();
renderAll();
