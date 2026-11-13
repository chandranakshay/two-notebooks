The human genome is about three billion base pairs long. CRISPR-Cas9 can cut at a single chosen spot in it. How does one protein find the right place so reliably?

# Two parts: a protein and a guide

The system has two key components. **Cas9** is the protein that cuts DNA. The **guide RNA** is a short strand, about 20 letters long, designed to match the target sequence. The guide sits inside Cas9 and tells it where to cut.

# The "password" next to the target

Cas9 doesn't read the whole genome letter by letter. It first looks for a very short sequence called the **PAM** (protospacer adjacent motif). For the most commonly used Cas9, the PAM is `NGG`: any letter followed by two Gs[^1].

Only when Cas9 finds a PAM does it pause and check whether the neighbouring DNA matches its guide. That makes the search much faster, because most of the genome can be skipped after a brief contact.

# Unzipping and checking

At a PAM, Cas9 starts to pull apart the two DNA strands next to it and tests whether the guide RNA pairs with them. The pairing begins right next to the PAM and extends outward. If the first several letters don't match, Cas9 lets go and moves on. If all of them match, the protein changes shape and cuts both strands.

> The PAM check is cheap and the full check is expensive, so Cas9 only does the expensive one when the cheap one passes.

# Why mistakes still happen

The match doesn't have to be perfect. Mismatches far from the PAM are tolerated more than mismatches close to it, which is one source of "off-target" cuts. A lot of current research is about engineering Cas9 variants and guide designs that are stricter about this.

[^1]: "N" means any of the four DNA letters (A, C, G or T).
