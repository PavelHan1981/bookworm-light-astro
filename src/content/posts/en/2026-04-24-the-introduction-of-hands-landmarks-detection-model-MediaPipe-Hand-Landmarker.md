---
title: "Introduction to MediaPipe Hand Landmarker: Hand Landmark Detection Model"
slug: "2026-04-24-the-introduction-of-hands-landmarks-detection-model-MediaPipe-Hand-Landmarker"
description: "Google's MediaPipe Hand Landmarker is currently one of the most popular and efficient hand landmark detection models in the field of computer vision."
date: 2026-04-24T00:00:00.000Z
image: "/images/blog/default.jpg"
categories: ["AI"]
tags: ["TFLite","CNN"]
draft: false
---


## Introduction to MediaPipe Hand Landmarker


Google's MediaPipe Hand Landmarker (a hand landmark detection model based on the MediaPipe inference framework) is currently one of the most popular and efficient **real-time hand landmark detection and tracking** solutions in the field of computer vision. It can run on mobile devices (Android/iOS), web browsers, and even resource-constrained edge devices, outputting the 3D coordinate positions of 21 hand landmarks within the image at real-time frame rates.


The figure below shows the coordinate positioning indices of the 21 finger joint landmarks within the hand region that this hand landmark model package can detect. This model was trained on approximately 30,000 real images as well as multiple rendered synthetic hand models superimposed on various backgrounds.


![image.png](/images/blog/手部特征点检测模型MediaPipe-Hand-Landmarker介绍-1.png)


Google provides official implementations of the Hand Landmarker model for four platforms: iOS, Android, Web, and Python. Therefore, if you are using this model on these four platforms, you can directly refer to the official sample code to easily invoke the model and fulfill your application requirements.


So, **what if you want to run this model on other platforms and languages, such as using C/C++ to invoke it on other embedded platforms?**


The answer is yes, absolutely, but it is slightly more complicated. Running the Hand Landmarker model relies on Google's open-source MediaPipe inference framework. At its core, the underlying architecture of this inference framework is a C++-based streaming ML framework that manages data flow through graph computation, using TensorFlow Lite as its inference backend.


MediaPipe itself is open-source and extremely friendly to commercial applications. Its code repository is hosted on GitHub: [https://github.com/google-ai-edge/mediapipe](https://github.com/google-ai-edge/mediapipe). It is licensed under the Apache 2.0 License, allowing you to freely use, modify, distribute, or even integrate it into your proprietary commercial software without the obligation to open-source your business logic code.


Therefore, to run this model using C/C++, you first need to cross-compile the MediaPipe framework for your system and then invoke the model's inference capabilities on top of this framework.


## Model Workflow and Output Data Parsing


The core reason why the MediaPipe Hand Landmarker model achieves extremely high performance and detection frame rates lies in its adoption of a **cascaded two-stage network architecture**:

1. Hand Detector:
    - This model is an extremely lightweight SSD (Single Shot Detector) architecture model whose task is to quickly locate the bounding box of the entire palm in the whole image, returning an oriented bounding box.
    - In video images, hands undergo extreme deformation (fingers can bend and cross), making direct detection of the entire hand very difficult. A palm, however, is a relatively rigid structure with distinct square-like features that are extremely easy for the network to capture.
2. Hand Landmark Detector:
    - Once the first-stage Hand Detector model finds the palm region, the entire system crops, rotates, and aligns that region (using the bounding box returned by the first-stage model) and feeds it into the second-stage Landmarker model. This model is specialized in precisely detecting 21 3D coordinates on the cropped patch.
    - Because the second-stage model only needs to perform inference and detection within a cropped local region, it drastically reduces computational complexity and filters out irrelevant background interference. This is the fundamental reason why the model runs both fast and accurately.


![mediapipe_architecture.png](/images/blog/手部特征点检测模型MediaPipe-Hand-Landmarker介绍-2.png)


In the API design and execution workflow of the model, the MediaPipe Tasks API includes three running modes (`IMAGE`, `VIDEO`, and `LIVE_STREAM`), which correspond to three application scenarios: single images, image frames from video files, and real-time streams with callbacks, respectively. These correspond to the following three API invocation interfaces:

- `detect(image)`: Image mode (`IMAGE`). **Executes without any memory/state.** Each input image requires the system to first locate the hand across the entire image and then detect the 21 hand landmarks. This is suitable for processing static photo sets on disk.
- `detect_for_video(image, timestamp_ms)`: Video mode (`VIDEO`). **Stateful with synchronous blocking execution.** During inference, it internally maintains a Region of Interest (ROI) cache. Once the hand region is found in the previous frame, it can directly locate that region in the next frame to run lightweight landmark detection. This is suitable for processing pre-recorded local video files.
- `detect_async(image, timestamp_ms)`: Asynchronous live stream mode (`LIVE_STREAM`). **Stateful with asynchronous non-blocking execution,** custom-tailored for real-time camera images. The main thread sends images to the model inference framework and returns immediately without waiting for results. Once the underlying C++ thread pool in the inference framework finishes computation, it returns the results to the main thread via a callback function. Therefore, using this mode requires passing a `result_callback` parameter when initializing `HandLandmarkerOptions` to specify which function is responsible for receiving the asynchronous results returned by C++ code.

The figure below illustrates the data structure of the results returned after detecting hands and their landmarks in an image using the above interfaces:


![MediaPipe_Result_Structure.png](/images/blog/手部特征点检测模型MediaPipe-Hand-Landmarker介绍-3.png)


Below is a code example for parsing and calling the results returned by the API:


```python
def parse_result(result):
    if not result.hand_landmarks:
        return "No hands detected in the frame"

    # Iterate through each detected hand (assuming N=2)
    for idx in range(len(result.hand_landmarks)):
        # Extract the 21 landmarks of the hand
        landmarks = result.hand_landmarks[idx]
        # Extract whether the hand is left or right
        hand_type = result.handedness[idx][0].category_name
        confidence = result.handedness[idx][0].score
        
        # Extract the coordinates of the index fingertip (the 8th landmark)
        index_finger_tip = landmarks[8]
        
        print(f"Detected {hand_type} (Confidence: {confidence:.2f})")
        print(f"Index Fingertip: x={index_finger_tip.x:.3f}, y={index_finger_tip.y:.3f}, z={index_finger_tip.z:.3f}")
```


## Model Running Example


To run this model locally on a PC using Python, you need to install Google's MediaPipe support package and download the `hand_landmarker.task` model package file.


```python
pip install mediapipe
```


The download link for the `hand_landmarker.task` model package is: [https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task](https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task)


This `hand_landmarker.task` model file uses `.task` as its file extension, but **it is essentially a compressed archive** containing two model files: `hand_detector.tflite` (palm detection model) and `hand_landmarks_detector.tflite` (hand landmark detection model). You can simply rename the model file to have a `.zip` extension and open it to view its contents:


![f15c88bc-9cbc-4f6a-937d-bb545d301cb6.png](/images/blog/手部特征点检测模型MediaPipe-Hand-Landmarker介绍-4.png)


The following code implements an application example that uses OpenCV to perform hand and landmark detection and annotation on images from a local PC camera:


```python
import cv2
import time
import math
import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

# ==========================================
# 1. Configure MediaPipe Tasks API
# ==========================================
model_path = 'hand_landmarker.task' # Ensure this file is in the same directory
base_options = python.BaseOptions(model_asset_path=model_path)
options = vision.HandLandmarkerOptions(
    base_options=base_options,
    num_hands=2,
    min_hand_detection_confidence=0.5,
    min_tracking_confidence=0.5,
    running_mode=vision.RunningMode.VIDEO
)
detector = vision.HandLandmarker.create_from_options(options)

# 2. Custom hand skeletal topology
HAND_CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 4),         # Thumb
    (0, 5), (5, 6), (6, 7), (7, 8),         # Index finger
    (9, 10), (10, 11), (11, 12),            # Middle finger
    (13, 14), (14, 15), (15, 16),           # Ring finger
    (0, 17), (17, 18), (18, 19), (19, 20),  # Pinky finger
    (5, 9), (9, 13), (13, 17)               # Palm metacarpals
]

def process_and_draw(frame, detection_result):
    """Extract coordinates, render skeleton, and compute physical actions"""
    if not detection_result.hand_landmarks:
        return frame

    h, w, _ = frame.shape
    for hand_landmarks in detection_result.hand_landmarks:
        # 1. Coordinate dimensionality reduction: convert 21 normalized coordinates back to actual pixel matrices [21, 2]
        pixel_pts = []
        for lm in hand_landmarks:
            px, py = int(lm.x * w), int(lm.y * h)
            pixel_pts.append((px, py))

        # 2. High-speed skeletal connection rendering
        for p1, p2 in HAND_CONNECTIONS:
            cv2.line(frame, pixel_pts[p1], pixel_pts[p2], (255, 200, 0), 2)

        # 3. Render 21 joint nodes
        for px, py in pixel_pts:
            cv2.circle(frame, (px, py), 4, (0, 0, 255), -1)

        # 4. Core industrial logic: Scale-invariant pinch detection
        # Extract key points: 0 (wrist), 4 (thumb tip), 5 (index MCP), 8 (index tip)
        wrist = pixel_pts[0]
        index_mcp = pixel_pts[5]
        thumb_tip = pixel_pts[4]
        index_tip = pixel_pts[8]

        # Euclidean distance calculation
        D_pinch = math.hypot(index_tip[0] - thumb_tip[0], index_tip[1] - thumb_tip[1])
        L_ref = math.hypot(index_mcp[0] - wrist[0], index_mcp[1] - wrist[1])

        # Prevent division by zero in extremely rare cases
        ratio = D_pinch / (L_ref + 1e-6)

        # UI interaction feedback: trigger event if within the pinch threshold!
        if ratio < 0.25:  # 0.25 is a very robust industrial empirical value
            cv2.line(frame, thumb_tip, index_tip, (0, 255, 0), 4) # Green connection line
            cv2.putText(frame, "STATUS: PINCHING!", (wrist[0]-50, wrist[1]+50), 
                        cv2.FONT_HERSHEY_DUPLEX, 0.8, (0, 255, 0), 2)
        else:
            cv2.line(frame, thumb_tip, index_tip, (0, 0, 255), 2) # Red connection line
            cv2.putText(frame, "STATUS: OPEN", (wrist[0]-50, wrist[1]+50), 
                        cv2.FONT_HERSHEY_DUPLEX, 0.8, (0, 0, 255), 2)

    return frame

# 3. Video stream main loop
cap = cv2.VideoCapture(0)
p_time = 0

while cap.isOpened():
    success, frame = cap.read()
    if not success:
        break

    frame = cv2.flip(frame, 1)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
    frame_timestamp_ms = int(time.time() * 1000)
    
    # Core inference
    result = detector.detect_for_video(mp_image, frame_timestamp_ms)
    
    # Pass the raw BGR frame into the custom processing engine
    final_frame = process_and_draw(frame, result)

    # Calculate FPS
    c_time = time.time()
    fps = 1 / (c_time - p_time) if (c_time - p_time) > 0 else 0
    p_time = c_time
    cv2.putText(final_frame, f'FPS: {int(fps)}', (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)

    cv2.imshow('Industrial Hand Tracking', final_frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
```


## References

- [https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker?hl=zh-cn](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker?hl=zh-cn)
- [hand_landmarker.ipynb - Colab](https://colab.research.google.com/github/googlesamples/mediapipe/blob/main/examples/hand_landmarker/python/hand_landmarker.ipynb?hl=zh-cn#scrollTo=_JVO3rvPD4RN)
- [mp.tasks.vision.RunningMode  |  Google AI Edge  |  Google AI for Developers](https://ai.google.dev/edge/api/mediapipe/python/mp/tasks/vision/RunningMode)