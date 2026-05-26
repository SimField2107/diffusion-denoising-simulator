#!/usr/bin/env python3
"""
Generate denoising trajectories for the diffusion model simulator.

Uses mathematically correct forward diffusion to create oracle trajectories that
accurately represent the DDPM denoising process. For each trajectory:
- Start with a synthetic "target" image
- Apply the forward noising process at each timestep
- Record (x_t, true_noise, x0_estimate) at each step

This produces educationally accurate visualizations without requiring model weights.

Usage:
    python generate_trajectories.py [--dataset mnist|cifar|both] [--output-dir ../public/data]
"""

import argparse
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image
from sklearn.decomposition import PCA
from tqdm import tqdm

NUM_TRAJECTORIES = 8
NUM_TIMESTEPS = 100
TOTAL_TIMESTEPS = 1000
SEEDS = list(range(42, 42 + NUM_TRAJECTORIES))

BETA_START = 1e-4
BETA_END = 0.02


def get_ddim_timesteps(num_steps: int, total_steps: int) -> list[int]:
    """Generate evenly spaced timesteps for DDIM sampling (high to low)."""
    step_ratio = total_steps // num_steps
    timesteps = list(range(0, total_steps, step_ratio))[:num_steps]
    return timesteps[::-1]


def compute_schedule(beta_start: float, beta_end: float, num_steps: int) -> dict:
    """Compute linear noise schedule parameters."""
    betas = np.linspace(beta_start, beta_end, num_steps)
    alphas = 1.0 - betas
    alpha_bars = np.cumprod(alphas)
    return {
        "betas": betas,
        "alphas": alphas,
        "alpha_bars": alpha_bars,
    }


def normalize_for_image(arr: np.ndarray, vmin: float, vmax: float) -> np.ndarray:
    """Normalize array to [0, 255] uint8 for image saving."""
    arr = np.clip(arr, vmin, vmax)
    arr = (arr - vmin) / (vmax - vmin)
    arr = (arr * 255).astype(np.uint8)
    return arr


def create_sprite_sheet(
    frames: list[np.ndarray], num_rows: int, num_cols: int, cell_h: int, cell_w: int, channels: int
) -> Image.Image:
    """Create a sprite sheet from a list of frames."""
    if channels == 1:
        sheet = np.zeros((num_rows * cell_h, num_cols * cell_w), dtype=np.uint8)
    else:
        sheet = np.zeros((num_rows * cell_h, num_cols * cell_w, channels), dtype=np.uint8)

    for idx, frame in enumerate(frames):
        row = idx // num_cols
        col = idx % num_cols
        y0, y1 = row * cell_h, (row + 1) * cell_h
        x0, x1 = col * cell_w, (col + 1) * cell_w
        sheet[y0:y1, x0:x1] = frame

    if channels == 1:
        return Image.fromarray(sheet, mode="L")
    return Image.fromarray(sheet, mode="RGB")


def generate_digit_pattern(seed: int, size: int = 32) -> np.ndarray:
    """Generate a synthetic digit-like pattern (geometric shapes)."""
    np.random.seed(seed)
    img = np.zeros((size, size), dtype=np.float32)

    digit = seed % 10
    cx, cy = size // 2, size // 2
    r = size // 3

    if digit == 0:
        for y in range(size):
            for x in range(size):
                d = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
                if r - 3 < d < r + 3:
                    img[y, x] = 1.0
    elif digit == 1:
        img[4:-4, cx - 2 : cx + 2] = 1.0
        img[-6:-4, cx - 4 : cx + 4] = 1.0
    elif digit == 2:
        img[4:8, cx - 6 : cx + 6] = 1.0
        img[cy - 2 : cy + 2, cx - 6 : cx + 6] = 1.0
        img[-8:-4, cx - 6 : cx + 6] = 1.0
        img[4 : cy, cx + 2 : cx + 6] = 1.0
        img[cy:-4, cx - 6 : cx - 2] = 1.0
    elif digit == 3:
        img[4:8, cx - 6 : cx + 6] = 1.0
        img[cy - 2 : cy + 2, cx - 4 : cx + 6] = 1.0
        img[-8:-4, cx - 6 : cx + 6] = 1.0
        img[4:-4, cx + 2 : cx + 6] = 1.0
    elif digit == 4:
        img[4 : cy + 2, cx - 6 : cx - 2] = 1.0
        img[cy - 2 : cy + 2, cx - 6 : cx + 6] = 1.0
        img[4:-4, cx + 2 : cx + 6] = 1.0
    elif digit == 5:
        img[4:8, cx - 6 : cx + 6] = 1.0
        img[cy - 2 : cy + 2, cx - 6 : cx + 6] = 1.0
        img[-8:-4, cx - 6 : cx + 6] = 1.0
        img[4 : cy, cx - 6 : cx - 2] = 1.0
        img[cy:-4, cx + 2 : cx + 6] = 1.0
    elif digit == 6:
        for y in range(size):
            for x in range(size):
                d = math.sqrt((x - cx) ** 2 + (y - cy - 4) ** 2)
                if r - 4 < d < r + 2:
                    img[y, x] = 1.0
        img[4 : cy + 4, cx - 6 : cx - 2] = 1.0
    elif digit == 7:
        img[4:8, cx - 6 : cx + 6] = 1.0
        for i in range(size - 8):
            x_pos = cx + 4 - i // 3
            if 0 <= x_pos < size:
                img[8 + i, max(0, x_pos - 2) : min(size, x_pos + 2)] = 1.0
    elif digit == 8:
        for y in range(size):
            for x in range(size):
                d1 = math.sqrt((x - cx) ** 2 + (y - cy // 2 - 2) ** 2)
                d2 = math.sqrt((x - cx) ** 2 + (y - cy - cy // 2 + 2) ** 2)
                r1, r2 = r * 0.6, r * 0.7
                if (r1 - 3 < d1 < r1 + 3) or (r2 - 3 < d2 < r2 + 3):
                    img[y, x] = 1.0
    else:
        for y in range(size):
            for x in range(size):
                d = math.sqrt((x - cx) ** 2 + (y - cy + 4) ** 2)
                if r - 4 < d < r + 2:
                    img[y, x] = 1.0
        img[cy - 4 : -4, cx + 2 : cx + 6] = 1.0

    img = (img * 2.0) - 1.0
    return img


def generate_color_pattern(seed: int, size: int = 32) -> np.ndarray:
    """Generate a synthetic colored pattern (abstract shapes)."""
    np.random.seed(seed)
    img = np.zeros((3, size, size), dtype=np.float32)

    bg_color = np.random.rand(3) * 0.3 - 0.15
    for c in range(3):
        img[c] = bg_color[c]

    num_shapes = np.random.randint(2, 5)
    for _ in range(num_shapes):
        shape_type = np.random.choice(["circle", "rect", "triangle"])
        color = np.random.rand(3) * 1.6 - 0.8

        if shape_type == "circle":
            cx, cy = np.random.randint(4, size - 4, 2)
            r = np.random.randint(3, size // 3)
            for y in range(max(0, cy - r), min(size, cy + r + 1)):
                for x in range(max(0, cx - r), min(size, cx + r + 1)):
                    if (x - cx) ** 2 + (y - cy) ** 2 <= r * r:
                        for c in range(3):
                            img[c, y, x] = color[c]

        elif shape_type == "rect":
            x0 = np.random.randint(0, size - 6)
            y0 = np.random.randint(0, size - 6)
            w = np.random.randint(4, min(size - x0, size // 2))
            h = np.random.randint(4, min(size - y0, size // 2))
            for c in range(3):
                img[c, y0 : y0 + h, x0 : x0 + w] = color[c]

        else:
            pts = np.random.randint(2, size - 2, (3, 2))
            min_y, max_y = pts[:, 1].min(), pts[:, 1].max()
            for y in range(min_y, max_y + 1):
                intersects = []
                for i in range(3):
                    p1, p2 = pts[i], pts[(i + 1) % 3]
                    if p1[1] == p2[1]:
                        continue
                    if min(p1[1], p2[1]) <= y <= max(p1[1], p2[1]):
                        x_int = p1[0] + (y - p1[1]) * (p2[0] - p1[0]) / (p2[1] - p1[1])
                        intersects.append(int(x_int))
                if len(intersects) >= 2:
                    intersects.sort()
                    for x in range(max(0, intersects[0]), min(size, intersects[-1] + 1)):
                        for c in range(3):
                            img[c, y, x] = color[c]

    img = np.clip(img, -1.0, 1.0)
    return img


def run_reverse_diffusion(
    x_0: np.ndarray,
    schedule: dict,
    timesteps: list[int],
    seed: int,
) -> tuple[list[np.ndarray], list[np.ndarray], list[np.ndarray], list[dict]]:
    """
    Simulate the reverse diffusion process using the known forward process.

    For visualization, we compute what each x_t would look like at each timestep,
    working backwards from pure noise to the clean image.
    """
    np.random.seed(seed)
    alpha_bars = schedule["alpha_bars"]

    shape = x_0.shape
    base_noise = np.random.randn(*shape).astype(np.float32)

    x_frames = []
    eps_frames = []
    x0_frames = []
    metrics = []

    for step_idx, t in enumerate(timesteps):
        sqrt_alpha_bar = math.sqrt(alpha_bars[t])
        sqrt_one_minus_alpha_bar = math.sqrt(1.0 - alpha_bars[t])

        x_t = sqrt_alpha_bar * x_0 + sqrt_one_minus_alpha_bar * base_noise

        eps_pred = base_noise + np.random.randn(*shape).astype(np.float32) * 0.05

        x0_pred = (x_t - sqrt_one_minus_alpha_bar * eps_pred) / max(sqrt_alpha_bar, 1e-6)
        x0_pred = np.clip(x0_pred, -1.0, 1.0)

        snr = alpha_bars[t] / max(1.0 - alpha_bars[t], 1e-10)
        eps_norm = float(np.linalg.norm(eps_pred))
        x0_mse = float(np.mean((x0_pred - x_0) ** 2))

        x_frames.append(x_t)
        eps_frames.append(eps_pred)
        x0_frames.append(x0_pred)
        metrics.append({"t": int(t), "snr": float(snr), "epsNorm": eps_norm, "x0Mse": x0_mse})

    return x_frames, eps_frames, x0_frames, metrics


def generate_mnist_trajectories(output_dir: Path):
    """Generate synthetic MNIST-style trajectories."""
    print("Generating MNIST trajectories...")

    image_size = 32
    channels = 1
    schedule = compute_schedule(BETA_START, BETA_END, TOTAL_TIMESTEPS)
    timesteps = get_ddim_timesteps(NUM_TIMESTEPS, TOTAL_TIMESTEPS)

    all_x_frames = []
    all_eps_frames = []
    all_x0_frames = []
    all_metrics = []
    all_pca_vectors = []

    x_min, x_max = float("inf"), float("-inf")
    eps_min, eps_max = float("inf"), float("-inf")

    for traj_idx, seed in enumerate(tqdm(SEEDS)):
        x_0 = generate_digit_pattern(seed, image_size)
        x_0 = x_0.reshape(1, image_size, image_size)

        x_frames, eps_frames, x0_frames, metrics = run_reverse_diffusion(x_0, schedule, timesteps, seed + 1000)

        for step_idx, (x_t, eps, x0_pred) in enumerate(zip(x_frames, eps_frames, x0_frames)):
            all_x_frames.append(x_t)
            all_eps_frames.append(eps)
            all_x0_frames.append(x0_pred)
            all_pca_vectors.append((traj_idx, step_idx, x_t.flatten()))

            x_min = min(x_min, x_t.min())
            x_max = max(x_max, x_t.max())
            eps_min = min(eps_min, eps.min())
            eps_max = max(eps_max, eps.max())

        all_metrics.append({"trajId": traj_idx, "perStep": metrics})

    x_clip = max(abs(x_min), abs(x_max), 3.0)
    eps_clip = max(abs(eps_min), abs(eps_max), 3.0)

    print("Creating sprite sheets...")
    x_images = [normalize_for_image(f.squeeze(), -x_clip, x_clip) for f in all_x_frames]
    eps_images = [normalize_for_image(f.squeeze(), -eps_clip, eps_clip) for f in all_eps_frames]
    x0_images = [normalize_for_image(f.squeeze(), -1.0, 1.0) for f in all_x0_frames]

    x_sheet = create_sprite_sheet(x_images, NUM_TRAJECTORIES, NUM_TIMESTEPS, image_size, image_size, channels)
    eps_sheet = create_sprite_sheet(eps_images, NUM_TRAJECTORIES, NUM_TIMESTEPS, image_size, image_size, channels)
    x0_sheet = create_sprite_sheet(x0_images, NUM_TRAJECTORIES, NUM_TIMESTEPS, image_size, image_size, channels)

    print("Computing PCA projections...")
    pca_matrix = np.array([v[2] for v in all_pca_vectors])
    pca = PCA(n_components=2)
    pca_result = pca.fit_transform(pca_matrix)

    pca_points = []
    for idx, (traj_idx, step_idx, _) in enumerate(all_pca_vectors):
        pca_points.append({
            "trajId": traj_idx,
            "stepIdx": step_idx,
            "x": float(pca_result[idx, 0]),
            "y": float(pca_result[idx, 1]),
        })

    output_dir.mkdir(parents=True, exist_ok=True)
    x_sheet.save(output_dir / "frames.png")
    eps_sheet.save(output_dir / "eps.png")
    x0_sheet.save(output_dir / "x0pred.png")

    metadata = {
        "dataset": "mnist",
        "imageSize": image_size,
        "channels": channels,
        "numTrajectories": NUM_TRAJECTORIES,
        "sampledTimesteps": timesteps,
        "schedule": {
            "type": "linear",
            "betaStart": BETA_START,
            "betaEnd": BETA_END,
            "alphaBars": [float(schedule["alpha_bars"][t]) for t in timesteps],
        },
        "normalization": {
            "x": {"min": float(-x_clip), "max": float(x_clip)},
            "eps": {"min": float(-eps_clip), "max": float(eps_clip)},
            "x0pred": {"min": -1.0, "max": 1.0},
        },
        "metrics": all_metrics,
        "pca": {
            "explainedVariance": [float(v) for v in pca.explained_variance_ratio_],
            "points": pca_points,
        },
    }

    with open(output_dir / "trajectories.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"MNIST data saved to {output_dir}")


def generate_cifar_trajectories(output_dir: Path):
    """Generate synthetic CIFAR-style trajectories."""
    print("Generating CIFAR-10 trajectories...")

    image_size = 32
    channels = 3
    schedule = compute_schedule(BETA_START, BETA_END, TOTAL_TIMESTEPS)
    timesteps = get_ddim_timesteps(NUM_TIMESTEPS, TOTAL_TIMESTEPS)

    all_x_frames = []
    all_eps_frames = []
    all_x0_frames = []
    all_metrics = []
    all_pca_vectors = []

    x_min, x_max = float("inf"), float("-inf")
    eps_min, eps_max = float("inf"), float("-inf")

    for traj_idx, seed in enumerate(tqdm(SEEDS)):
        x_0 = generate_color_pattern(seed, image_size)

        x_frames, eps_frames, x0_frames, metrics = run_reverse_diffusion(x_0, schedule, timesteps, seed + 2000)

        for step_idx, (x_t, eps, x0_pred) in enumerate(zip(x_frames, eps_frames, x0_frames)):
            all_x_frames.append(x_t)
            all_eps_frames.append(eps)
            all_x0_frames.append(x0_pred)
            all_pca_vectors.append((traj_idx, step_idx, x_t.flatten()))

            x_min = min(x_min, x_t.min())
            x_max = max(x_max, x_t.max())
            eps_min = min(eps_min, eps.min())
            eps_max = max(eps_max, eps.max())

        all_metrics.append({"trajId": traj_idx, "perStep": metrics})

    x_clip = max(abs(x_min), abs(x_max), 3.0)
    eps_clip = max(abs(eps_min), abs(eps_max), 3.0)

    print("Creating sprite sheets...")
    x_images = []
    eps_images = []
    x0_images = []

    for f in all_x_frames:
        arr = normalize_for_image(f, -x_clip, x_clip)
        arr = np.transpose(arr, (1, 2, 0))
        x_images.append(arr)

    for f in all_eps_frames:
        arr = normalize_for_image(f, -eps_clip, eps_clip)
        arr = np.transpose(arr, (1, 2, 0))
        eps_images.append(arr)

    for f in all_x0_frames:
        arr = normalize_for_image(f, -1.0, 1.0)
        arr = np.transpose(arr, (1, 2, 0))
        x0_images.append(arr)

    x_sheet = create_sprite_sheet(x_images, NUM_TRAJECTORIES, NUM_TIMESTEPS, image_size, image_size, channels)
    eps_sheet = create_sprite_sheet(eps_images, NUM_TRAJECTORIES, NUM_TIMESTEPS, image_size, image_size, channels)
    x0_sheet = create_sprite_sheet(x0_images, NUM_TRAJECTORIES, NUM_TIMESTEPS, image_size, image_size, channels)

    print("Computing PCA projections...")
    pca_matrix = np.array([v[2] for v in all_pca_vectors])
    pca = PCA(n_components=2)
    pca_result = pca.fit_transform(pca_matrix)

    pca_points = []
    for idx, (traj_idx, step_idx, _) in enumerate(all_pca_vectors):
        pca_points.append({
            "trajId": traj_idx,
            "stepIdx": step_idx,
            "x": float(pca_result[idx, 0]),
            "y": float(pca_result[idx, 1]),
        })

    output_dir.mkdir(parents=True, exist_ok=True)
    x_sheet.save(output_dir / "frames.png")
    eps_sheet.save(output_dir / "eps.png")
    x0_sheet.save(output_dir / "x0pred.png")

    metadata = {
        "dataset": "cifar",
        "imageSize": image_size,
        "channels": channels,
        "numTrajectories": NUM_TRAJECTORIES,
        "sampledTimesteps": timesteps,
        "schedule": {
            "type": "linear",
            "betaStart": BETA_START,
            "betaEnd": BETA_END,
            "alphaBars": [float(schedule["alpha_bars"][t]) for t in timesteps],
        },
        "normalization": {
            "x": {"min": float(-x_clip), "max": float(x_clip)},
            "eps": {"min": float(-eps_clip), "max": float(eps_clip)},
            "x0pred": {"min": -1.0, "max": 1.0},
        },
        "metrics": all_metrics,
        "pca": {
            "explainedVariance": [float(v) for v in pca.explained_variance_ratio_],
            "points": pca_points,
        },
    }

    with open(output_dir / "trajectories.json", "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"CIFAR-10 data saved to {output_dir}")


def main():
    parser = argparse.ArgumentParser(description="Generate diffusion model denoising trajectories")
    parser.add_argument(
        "--dataset",
        choices=["mnist", "cifar", "both"],
        default="both",
        help="Which dataset(s) to generate trajectories for",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=Path(__file__).parent.parent / "public" / "data",
        help="Output directory for generated data",
    )
    args = parser.parse_args()

    if args.dataset in ("mnist", "both"):
        generate_mnist_trajectories(args.output_dir / "mnist")

    if args.dataset in ("cifar", "both"):
        generate_cifar_trajectories(args.output_dir / "cifar")

    print("Done!")


if __name__ == "__main__":
    main()
