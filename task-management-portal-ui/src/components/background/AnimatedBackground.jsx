import { Box } from "@mui/material";

function AnimatedBackground() {
  return (
    <>
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: -2,
          overflow: "hidden",
          background:
            "linear-gradient(135deg,#020617 0%,#0F172A 45%,#1E293B 100%)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(56,189,248,.35), transparent 70%)",
            top: "-120px",
            left: "-120px",
            animation: "float1 12s ease-in-out infinite",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            width: 450,
            height: 450,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(37,99,235,.28), transparent 70%)",
            bottom: "-120px",
            right: "-100px",
            animation: "float2 16s ease-in-out infinite",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            opacity: 0.25,
          }}
        />
      </Box>

      <style>
        {`
          @keyframes float1{
            0%{transform:translate(0,0) scale(1);}
            50%{transform:translate(80px,60px) scale(1.15);}
            100%{transform:translate(0,0) scale(1);}
          }

          @keyframes float2{
            0%{transform:translate(0,0) scale(1);}
            50%{transform:translate(-90px,-70px) scale(1.2);}
            100%{transform:translate(0,0) scale(1);}
          }
        `}
      </style>
    </>
  );
}

export default AnimatedBackground;