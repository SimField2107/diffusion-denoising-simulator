# Trajectory Generation Scripts

This folder contains the Python script for generating pre-computed denoising trajectories.

## Requirements

Python 3.10+ with PyTorch. Install dependencies:

```bash
pip install -r requirements.txt
```

For GPU acceleration, install the appropriate PyTorch version for your CUDA setup first.

## Usage

Generate trajectories for both datasets:

```bash
python generate_trajectories.py
```

Or generate for a specific dataset:

```bash
python generate_trajectories.py --dataset mnist
python generate_trajectories.py --dataset cifar
```

The script will download pretrained models from HuggingFace on first run:
- MNIST: `alkzar90/ddpm-mnist-32`
- CIFAR-10: `google/ddpm-cifar10-32`

## Output

For each dataset, the script produces:

- `frames.png` - Sprite sheet of x_t (noisy states), 8 rows x 100 columns
- `eps.png` - Sprite sheet of predicted noise
- `x0pred.png` - Sprite sheet of predicted clean images
- `trajectories.json` - Metadata including schedule params, metrics, and PCA projections

Total output size is approximately 2MB for both datasets combined.

## Reproducibility

Trajectories use fixed seeds (42-49) for reproducibility. Running the script again
will produce identical outputs.
