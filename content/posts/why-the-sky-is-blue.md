Most of us get the short answer in school: sunlight scatters off air, and blue light scatters more than red. That's true. But if you follow the reasoning all the way, it predicts a *violet* sky. So something else must be going on.

# The short version

Sunlight contains every visible colour. As it passes through the atmosphere, it bumps into nitrogen and oxygen molecules, which are far smaller than the wavelength of visible light. Light hitting particles that small is scattered in a way called **Rayleigh scattering**[^1], and the amount of scattering depends very steeply on wavelength.

# How steep is "steeply"?

The intensity of Rayleigh scattering goes as one over the wavelength to the fourth power:

```
I ∝ 1 / λ⁴
```

That fourth power matters a lot. Halving the wavelength makes scattering sixteen times stronger. Comparing a few colours against red light (700 nm):

| Colour | Wavelength | Scattering relative to red |
|---|---|---|
| Red | 700 nm | 1.0× |
| Green | 530 nm | about 3.0× |
| Blue | 450 nm | about 5.9× |
| Violet | 400 nm | about 9.4× |

So blue light is scattered roughly six times more than red. Every part of the sky away from the sun sends that scattered short-wavelength light to your eyes, which is why the sky glows while space stays black.

# So why isn't it violet?

By the table, violet scatters even more than blue. Three things work against it:

1. **The sun emits less violet.** Sunlight peaks in the green–blue range, and there is less energy in the violet end to start with.
2. **Some violet is absorbed high up.** Ozone and other gases absorb part of the shortest wavelengths before they reach us.
3. **Our eyes are bad at violet.** Our three types of cone cell overlap, and the light scattered from the sky stimulates both the "blue" cones and, to a lesser extent, the "green" ones. The brain reads that mixture as a pale sky blue rather than violet[^2].

::: In other words, the physics produces a blue-violet sky, and our eyes turn it into the blue we see. :::

# Sunsets follow from the same rule

At sunset, sunlight travels through much more air to reach you. Most of the blue has been scattered out of the beam along the way, so what arrives directly is weighted towards orange and red. The same law explains both the midday blue and the evening red.

# Further reading

- Bohren, C. F. & Huffman, D. R., *Absorption and Scattering of Light by Small Particles*, the standard textbook treatment.
- Any good introduction to colour vision for the cone response curves.

[^1]: Named after Lord Rayleigh, who worked out the theory in the 1870s.
[^2]: This is why a photograph of the sky can look slightly different from what you remember seeing: a camera sensor's colour response is not the same as your eye's.
