#!/usr/bin/env python3
import cv2
import numpy as np
import time
import threading
import os
from queue import Queue
import argparse
import socket
import http.server
import socketserver
from http import HTTPStatus
import io
import base64
from PIL import Image
import json
import urllib.parse

class StreamingHandler(http.server.BaseHTTPRequestHandler):
    """
    HTTP handler for streaming video frames
    """
    def __init__(self, *args, camera_system=None, **kwargs):
        self.camera_system = camera_system
        super().__init__(*args, **kwargs)
    
    def do_GET(self):
        if self.path == '/':
            # Serve the HTML page with JavaScript for viewing the stream
            self.send_response(HTTPStatus.OK)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            
            # HTML content with JavaScript for viewing the stream
            html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Raspberry Pi 360° Camera View</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {{ margin: 0; padding: 0; display: flex; flex-direction: column; align-items: center; }}
                    h1 {{ color: #333; }}
                    #videoContainer {{ width: 100%; max-width: 1000px; overflow: hidden; position: relative; }}
                    #stream {{ width: 100%; height: auto; }}
                    .controls {{ margin: 10px 0; padding: 10px; background: #f0f0f0; border-radius: 5px; width: 100%; max-width: 980px; }}
                    button {{ margin: 0 5px; padding: 8px 15px; border: none; border-radius: 4px; background: #2196F3; color: white; cursor: pointer; }}
                    button:hover {{ background: #0b7dda; }}
                </style>
            </head>
            <body>
                <h1>Raspberry Pi 360° Camera View</h1>
                <div id="videoContainer">
                    <img id="stream" src="/stream" alt="360° Camera Stream">
                </div>
                <div class="controls">
                    <button id="startStream">Start Stream</button>
                    <button id="stopStream">Stop Stream</button>
                </div>
                
                <script>
                    // Variables to control streaming
                    let isStreaming = true;
                    const streamImg = document.getElementById('stream');
                    let streamUrl = '/mjpeg';
                    
                    // Function to start streaming
                    function startStream() {{
                        streamImg.src = streamUrl + '?t=' + new Date().getTime();
                        isStreaming = true;
                    }}
                    
                    // Function to stop streaming
                    function stopStream() {{
                        streamImg.src = '';
                        isStreaming = false;
                    }}
                    
                    // Event listeners for buttons
                    document.getElementById('startStream').addEventListener('click', startStream);
                    document.getElementById('stopStream').addEventListener('click', stopStream);
                    
                    // Initialize stream
                    startStream();
                </script>
            </body>
            </html>
            """
            self.wfile.write(html.encode('utf-8'))
            
        elif self.path.startswith('/mjpeg'):
            self.send_response(HTTPStatus.OK)
            self.send_header('Content-Type', 'multipart/x-mixed-replace; boundary=--jpgboundary')
            self.end_headers()
            try:
                while True:
                    if not self.camera_system.running:
                        break
                        
                    # Get the latest frame
                    frame = None
                    with self.camera_system.lock:
                        if self.camera_system.output_frame is not None:
                            frame = self.camera_system.output_frame.copy()
                    
                    if frame is not None:
                        # Encode frame as JPEG
                        _, jpeg = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
                        
                        # Send frame
                        self.wfile.write(b"--jpgboundary\r\n")
                        self.wfile.write(b"Content-Type: image/jpeg\r\n")
                        self.wfile.write(f"Content-Length: {len(jpeg.tobytes())}\r\n\r\n".encode())
                        self.wfile.write(jpeg.tobytes())
                        self.wfile.write(b"\r\n")
                    
                    time.sleep(1/25)  # Limit to 25 FPS for streaming
                    
            except (BrokenPipeError, ConnectionResetError):
                # Client disconnected
                pass
        else:
            self.send_error(HTTPStatus.NOT_FOUND)
            
    def log_message(self, format, *args):
        # Suppress log messages for cleaner output
        pass


class Camera360System:
    def __init__(self, num_cameras=8, output_width=1920, output_height=720, 
                 camera_resolution=(640, 480), fps=30):
        """
        Initialize the 360° camera system.
        
        Args:
            num_cameras: Number of cameras in the system
            output_width: Width of the final panoramic output
            output_height: Height of the final panoramic output
            camera_resolution: Resolution of individual cameras
            fps: Target frames per second
        """
        self.num_cameras = num_cameras
        self.output_width = output_width
        self.output_height = output_height
        self.camera_resolution = camera_resolution
        self.fps = fps
        
        # Camera capture objects
        self.cameras = []
        
        # Image queues for each camera
        self.frame_queues = [Queue(maxsize=2) for _ in range(num_cameras)]
        
        # Transformation matrices for perspective correction and stitching
        self.homography_matrices = []
        
        # Output display
        self.output_frame = None
        
        # For synchronization
        self.lock = threading.Lock()
        self.running = False
        
        # Cache for warped frames to reduce computation
        self.warped_frames_cache = {}
        
        # Web server for streaming
        self.web_server = None
        self.stream_port = 8000
        
    def initialize_cameras(self, camera_sources=None):
        """
        Initialize camera connections.
        
        Args:
            camera_sources: List of camera sources (device IDs or URLs)
        """
        if camera_sources is None:
            # Default to /dev/video0, /dev/video1, etc.
            camera_sources = [f"/dev/video{i}" for i in range(self.num_cameras)]
        
        print(f"Initializing {self.num_cameras} cameras...")
        for i, source in enumerate(camera_sources[:self.num_cameras]):
            try:
                # For USB cameras or other video sources
                if isinstance(source, str) and source.startswith('/dev/video'):
                    cam = cv2.VideoCapture(int(source.replace('/dev/video', '')))
                else:
                    cam = cv2.VideoCapture(source)
                
                # Set camera properties
                cam.set(cv2.CAP_PROP_FRAME_WIDTH, self.camera_resolution[0])
                cam.set(cv2.CAP_PROP_FRAME_HEIGHT, self.camera_resolution[1])
                cam.set(cv2.CAP_PROP_FPS, self.fps)
                
                if not cam.isOpened():
                    print(f"Failed to open camera {i} at {source}")
                    continue
                    
                self.cameras.append((i, cam))
                print(f"Camera {i} initialized successfully")
            except Exception as e:
                print(f"Error initializing camera {i} at {source}: {e}")
    
    def calibrate_cameras(self, calibration_images_path=None):
        """
        Calibrate cameras and compute homography matrices.
        
        This is a simplified version. In a real Tesla-like system, you would:
        1. Take calibration images with known patterns
        2. Find correspondence points between adjacent cameras
        3. Compute intrinsic parameters of each camera
        4. Compute homography matrices
        
        In this example, we use predefined matrices for demonstration.
        """
        print("Calibrating cameras...")
        
        # For a proper implementation, you'd need to:
        # 1. Collect calibration images (chessboard patterns)
        # 2. Find corners in the pattern for each camera
        # 3. Calculate distortion parameters
        # 4. Compute homography matrices between adjacent cameras
        
        # Example simplified calibration (these would normally be calculated)
        # These are placeholder transformations for demonstration
        for i in range(self.num_cameras):
            # Each camera covers 360/8 = 45 degrees of view
            angle = i * 45
            # Simple rotation matrix (this is oversimplified)
            # In a real system, these would be computed from camera calibration
            src_points = np.float32([[0, 0], [self.camera_resolution[0], 0], 
                                     [0, self.camera_resolution[1]], 
                                     [self.camera_resolution[0], self.camera_resolution[1]]])
            
            # Calculate destination points based on camera position in 360° array
            x_offset = int(i * self.output_width / self.num_cameras)
            segment_width = int(self.output_width / self.num_cameras)
            
            dst_points = np.float32([[x_offset, 0], [x_offset + segment_width, 0],
                                     [x_offset, self.output_height],
                                     [x_offset + segment_width, self.output_height]])
            
            # Compute homography matrix
            H = cv2.getPerspectiveTransform(src_points, dst_points)
            self.homography_matrices.append(H)
            
        print("Camera calibration complete")
    
    def capture_frames(self, camera_index, camera):
        """
        Continuously capture frames from a specific camera.
        
        Args:
            camera_index: Index of the camera
            camera: OpenCV VideoCapture object
        """
        while self.running:
            ret, frame = camera.read()
            if not ret:
                print(f"Failed to capture frame from camera {camera_index}")
                time.sleep(0.1)
                continue
            
            # Put frame in the queue, replacing old frame if queue is full
            if self.frame_queues[camera_index].full():
                try:
                    self.frame_queues[camera_index].get_nowait()
                except Exception:
                    pass
            
            self.frame_queues[camera_index].put(frame)
            
            # Control capture rate
            time.sleep(1.0 / self.fps / 2)  # Half the period to ensure we don't miss frames
    
    def warp_frame(self, frame, camera_index):
        """
        Apply perspective transformation to a frame.
        
        Args:
            frame: Input camera frame
            camera_index: Index of the camera
            
        Returns:
            Warped frame
        """
        # Create a hash of the frame for cache lookup
        frame_hash = hash(frame.tobytes())
        cache_key = (frame_hash, camera_index)
        
        # Check if the warped frame is in cache
        if cache_key in self.warped_frames_cache:
            return self.warped_frames_cache[cache_key]
        
        # Apply homography transformation
        H = self.homography_matrices[camera_index]
        warped = cv2.warpPerspective(frame, H, (self.output_width, self.output_height))
        
        # Store in cache (with simple LRU-like mechanism)
        if len(self.warped_frames_cache) > 16:  # limit cache size
            self.warped_frames_cache.clear()
        self.warped_frames_cache[cache_key] = warped
        
        return warped
    
    def blend_images(self, images):
        """
        Blend multiple warped images into a single panorama.
        
        Args:
            images: List of warped images
            
        Returns:
            Blended panoramic image
        """
        # Simple method: use maximum value at each pixel
        # For a more sophisticated approach, you'd use multi-band blending
        result = np.zeros((self.output_height, self.output_width, 3), dtype=np.uint8)
        
        # Create weight masks for smooth blending between cameras
        weights = []
        for i in range(self.num_cameras):
            weight = np.zeros((self.output_height, self.output_width), dtype=np.float32)
            segment_width = self.output_width // self.num_cameras
            center_x = int((i + 0.5) * segment_width)
            
            # Create a weight mask that's highest at the center of each camera's view
            for x in range(self.output_width):
                # Distance to the center of this camera's segment (wrapped for 360° effect)
                dist = min(abs(x - center_x), self.output_width - abs(x - center_x))
                # Convert to a weight - higher when closer to center
                weight[:, x] = max(0, 1 - (dist / (segment_width * 0.7)))
            
            weights.append(weight)
            
        # Normalize weights so they sum to 1 at each pixel
        weight_sum = sum(weights)
        weight_sum[weight_sum == 0] = 1  # Avoid division by zero
        normalized_weights = [w / weight_sum for w in weights]
        
        # Apply weighted blending
        for i, img in enumerate(images):
            # Expand weights to 3 channels
            weight = np.repeat(normalized_weights[i][:, :, np.newaxis], 3, axis=2)
            # Add weighted image to result
            result += (img * weight).astype(np.uint8)
            
        return result
    
    def stitch_frames(self):
        """
        Continuously stitch frames from all cameras.
        """
        while self.running:
            frames = []
            
            # Get the latest frame from each camera
            for i in range(self.num_cameras):
                try:
                    if not self.frame_queues[i].empty():
                        frame = self.frame_queues[i].get()
                        frames.append((i, frame))
                except Exception as e:
                    print(f"Error getting frame from queue {i}: {e}")
            
            if len(frames) < self.num_cameras / 2:
                # Not enough frames available yet
                time.sleep(0.01)
                continue
                
            # Warp and blend frames
            warped_frames = []
            for i, frame in frames:
                warped = self.warp_frame(frame, i)
                warped_frames.append(warped)
            
            # Blend the warped frames
            panorama = self.blend_images(warped_frames)
            
            # Update the output frame
            with self.lock:
                self.output_frame = panorama.copy()
    
    def display_output(self, window_name="360° View"):
        """
        Display the stitched panoramic view.
        """
        cv2.namedWindow(window_name, cv2.WINDOW_NORMAL)
        
        while self.running:
            with self.lock:
                if self.output_frame is not None:
                    cv2.imshow(window_name, self.output_frame)
            
            # Check for key press
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                self.running = False
    
    def save_video(self, output_path="output_360.mp4", duration=None):
        """
        Save the panoramic video to a file.
        
        Args:
            output_path: Path to save the video
            duration: Duration in seconds, None for indefinite
        """
        fourcc = cv2.VideoWriter_fourcc(*'MP4V')
        out = cv2.VideoWriter(output_path, fourcc, self.fps, 
                             (self.output_width, self.output_height))
        
        start_time = time.time()
        frames_written = 0
        
        while self.running:
            with self.lock:
                if self.output_frame is not None:
                    out.write(self.output_frame)
                    frames_written += 1
            
            # Check if duration has elapsed
            if duration is not None and time.time() - start_time > duration:
                break
                
            # Control frame rate
            time.sleep(1.0 / self.fps / 2)
            
        # Release the video writer
        out.release()
        print(f"Video saved to {output_path} ({frames_written} frames)")
    
    def start_streaming_server(self, port=8000):
        """
        Start an HTTP server to stream the video to remote devices.
        
        Args:
            port: Port number for the streaming server
        """
        self.stream_port = port
        
        # Create a custom handler with access to the camera system
        def handler(*args, **kwargs):
            StreamingHandler(*args, camera_system=self, **kwargs)
        
        # Create and start the HTTP server
        self.web_server = socketserver.ThreadingTCPServer(("", port), handler)
        
        # Get local IP address
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            # doesn't have to be reachable
            s.connect(('10.255.255.255', 1))
            ip = s.getsockname()[0]
        except Exception:
            ip = '127.0.0.1'
        finally:
            s.close()
            
        print(f"Streaming server started at http://{ip}:{port}")
        print(f"Access the stream on your phone by entering this URL in your browser: http://{ip}:{port}")
        
        # Run the server in a separate thread
        server_thread = threading.Thread(target=self.web_server.serve_forever)
        server_thread.daemon = True
        server_thread.start()
    
    def run(self, display=True, save_video=False, video_path="output_360.mp4", 
            duration=None, stream=True, stream_port=8000):
        """
        Run the 360° camera system.
        
        Args:
            display: Whether to display the output locally
            save_video: Whether to save video to a file
            video_path: Path to save the video
            duration: Duration in seconds, None for indefinite
            stream: Whether to stream video over HTTP
            stream_port: Port for the streaming server
        """
        self.running = True
        threads = []
        
        # Start camera capture threads
        for i, cam in self.cameras:
            t = threading.Thread(target=self.capture_frames, args=(i, cam))
            t.daemon = True
            t.start()
            threads.append(t)
        
        # Start stitching thread
        stitch_thread = threading.Thread(target=self.stitch_frames)
        stitch_thread.daemon = True
        stitch_thread.start()
        threads.append(stitch_thread)
        
        # Start display thread if requested
        if display:
            display_thread = threading.Thread(target=self.display_output)
            display_thread.daemon = True
            display_thread.start()
            threads.append(display_thread)
        
        # Start video saving thread if requested
        if save_video:
            video_thread = threading.Thread(target=self.save_video, args=(video_path, duration))
            video_thread.daemon = True
            video_thread.start()
            threads.append(video_thread)
            
        # Start streaming server if requested
        if stream:
            self.start_streaming_server(port=stream_port)
        
        try:
            # Keep running until interrupted or duration elapsed
            if duration is not None:
                time.sleep(duration)
                self.running = False
            else:
                # Wait for threads to finish (they won't because they're daemon threads)
                for t in threads:
                    t.join()
        except KeyboardInterrupt:
            print("Interrupted by user")
            self.running = False
        
        # Cleanup
        self.cleanup()
    
    def cleanup(self):
        """
        Clean up resources.
        """
        self.running = False
        time.sleep(0.5)  # Allow threads to terminate
        
        # Stop the web server if it's running
        if self.web_server:
            self.web_server.shutdown()
            self.web_server.server_close()
        
        # Release all cameras
        for _, cam in self.cameras:
            cam.release()
        
        # Close all OpenCV windows
        cv2.destroyAllWindows()
        print("360° camera system shut down")


def main():
    parser = argparse.ArgumentParser(description="Raspberry Pi 360° Camera System")
    parser.add_argument("--cameras", type=int, default=8, help="Number of cameras")
    parser.add_argument("--width", type=int, default=1920, help="Output width")
    parser.add_argument("--height", type=int, default=720, help="Output height")
    parser.add_argument("--fps", type=int, default=20, help="Target FPS")
    parser.add_argument("--duration", type=int, default=None, help="Duration in seconds")
    parser.add_argument("--save", action="store_true", help="Save video to file")
    parser.add_argument("--output", type=str, default="output_360.mp4", help="Output file path")
    parser.add_argument("--cam_width", type=int, default=640, help="Camera width")
    parser.add_argument("--cam_height", type=int, default=480, help="Camera height")
    parser.add_argument("--sources", type=str, default=None, 
                        help="Comma-separated list of camera sources")
    parser.add_argument("--stream", action="store_true", default=True, 
                        help="Stream video over HTTP")
    parser.add_argument("--port", type=int, default=8000, help="Streaming server port")
    parser.add_argument("--no-display", action="store_true", 
                        help="Disable local display (headless mode)")
    
    args = parser.parse_args()
    
    # Parse camera sources if provided
    camera_sources = None
    if args.sources:
        camera_sources = args.sources.split(',')
    
    # Initialize the system
    system = Camera360System(
        num_cameras=args.cameras,
        output_width=args.width,
        output_height=args.height,
        camera_resolution=(args.cam_width, args.cam_height),
        fps=args.fps
    )
    
    # Initialize cameras
    system.initialize_cameras(camera_sources)
    
    # Calibrate cameras
    system.calibrate_cameras()
    
    # Run the system
    system.run(
        display=not args.no_display,
        save_video=args.save,
        video_path=args.output,
        duration=args.duration,
        stream=args.stream,
        stream_port=args.port
    )


if __name__ == "__main__":
    main()
