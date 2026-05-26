# Diffusion Model Denoising Simulator

An interactive web visualization that lets you scrub through the denoising steps of a diffusion model, watching how pure Gaussian noise gradually resolves into a coherent image.

## Features

- **Scrubber interface**: Drag through timesteps (t=990 down to t=0) and watch the image at each denoising step
- **Three-pane view**: See the current noisy state, predicted noise, and clean image estimate side by side
- **Multiple datasets**: Toggle between MNIST (grayscale digits) and CIFAR-10 style (color patterns)
- **Trajectory selection**: Switch between 8 different denoising trajectories
- **Math telemetry**: Live display of β_t, ᾱ_t, SNR, noise norms, and reconstruction error
- **Latent trajectory**: 2D PCA projection showing how the image moves through latent space
- **Phase annotations**: Educational overlays explaining what happens at each denoising stage
- **Playback controls**: Play/pause, speed adjustment (1x-10x), direction toggle

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the simulator.

## Keyboard Shortcuts

- `Space` - Play/pause
- `←` / `→` - Step backward/forward
- `R` - Reset to start
- `1-4` - Set speed (1x, 2x, 5x, 10x)

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- Zustand for state management
- Canvas API for image rendering and charts

## Data Generation

The denoising trajectories are pre-computed and shipped as static assets. To regenerate:

```bash
cd scripts
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python generate_trajectories.py
```

This produces sprite sheets and JSON metadata for both MNIST and CIFAR-10 trajectories in `public/data/`.

## How It Works

The visualization demonstrates the denoising diffusion probabilistic model (DDPM) process:

1. **Forward process**: Add Gaussian noise progressively to a clean image
2. **Reverse process**: Learn to predict and remove noise at each timestep
3. **Sampling**: Start from pure noise and iteratively denoise to generate images

The key insight is that at each timestep t, the model predicts the noise component ε_θ(x_t, t), which is used to estimate both the clean image x̂_0 and the next less-noisy state x_{t-1}.

## Project Structure

```
├── app/
│   ├── layout.tsx      # Root layout with fonts
│   ├── page.tsx        # Main simulator page
│   └── globals.css     # Theme and base styles
├── components/
│   ├── PrimaryInstrument.tsx   # Three-pane image display
│   ├── TimestepScrubber.tsx    # Timeline and controls
│   ├── MathTelemetry.tsx       # Live metrics panel
│   ├── LatentTrajectoryChart.tsx  # PCA visualization
│   └── ...
├── lib/
│   ├── types.ts        # TypeScript interfaces
│   ├── schedule.ts     # Math helpers for diffusion
│   └── trajectoryStore.ts  # Data loading and caching
├── state/
│   └── simulatorStore.ts   # Zustand state
├── public/data/
│   ├── mnist/          # MNIST sprite sheets + JSON
│   └── cifar/          # CIFAR sprite sheets + JSON
└── scripts/
    └── generate_trajectories.py  # Data generation
```

## License

MIT
