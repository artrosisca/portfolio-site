"""The acoustic guitar's measurements, shared by art.py (the printed top) and models/guitar.py.
Units are metres; z runs up the guitar from the bottom of the body, x across it."""
import math

BODY_L = 0.48          # bottom of the body to the shoulder
BODY_W = 0.39          # lower bout, the widest point
SADDLE_Z = 0.165       # where the strings end on the bridge
SCALE = 0.645          # string length, saddle to nut
NUT_Z = SADDLE_Z + SCALE
HOLE_Z, HOLE_R = 0.325, 0.05

def fret_z(n):
    """Height of fret n (0 = the nut)."""
    return SADDLE_Z + SCALE * 2 ** (-n / 12)

JOIN_Z = fret_z(14)    # the neck meets the body at the 14th fret
BOARD_END_Z = fret_z(20) - 0.008

# half-width of the body along its length: lower bout, waist, upper bout, shoulder
_PROFILE = [(0.0, 0.0), (0.012, 0.12), (0.04, 0.165), (0.1, 0.193), (0.15, 0.195), (0.21, 0.18), (0.26, 0.145),
            (0.3, 0.128), (0.34, 0.135), (0.39, 0.145), (0.43, 0.135), (0.46, 0.11), (0.475, 0.075), (BODY_L, 0.0)]

def half_width(z):
    """Smooth (Catmull-Rom) half-width at height z."""
    P = _PROFILE
    z = min(max(z, 0.0), BODY_L)
    for i in range(len(P) - 1):
        if P[i][0] <= z <= P[i + 1][0]: break
    p0, p1, p2, p3 = P[max(i - 1, 0)], P[i], P[i + 1], P[min(i + 2, len(P) - 1)]
    t = (z - p1[0]) / (p2[0] - p1[0])
    a, b, c, d = p0[1], p1[1], p2[1], p3[1]
    return max(0.0, 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (3 * b - a - 3 * c + d) * t ** 3))

def outline(n=160):
    """The body's outline as (x, z), counter-clockwise, rounded at both ends."""
    right, left = [], []
    for i in range(n + 1):
        # denser near the ends, where the curve turns fast
        z = BODY_L * (0.5 - 0.5 * math.cos(math.pi * i / n))
        w = half_width(z)
        right.append((w, z)); left.append((-w, z))
    return right + left[::-1][1:-1]
