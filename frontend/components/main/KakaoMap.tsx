import React from "react";
import { View, StyleSheet, Platform, Image } from "react-native"; // 👈 Image 추가
import { WebView } from "react-native-webview";

const KAKAO_JS_API_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_API_KEY;

type KakaoMapProps = {
  latitude: number;
  longitude: number;
  pinColor?: string;
  onCenterChange?: (center: { lat: number; lng: number }) => void;
};

export default function KakaoMap({ latitude, longitude, onCenterChange }: KakaoMapProps) {
  if (Platform.OS === "web") {
    return <div id="kakao-map" style={{ width: "100%", height: "100%" }} />;
  }
  const pinUri = Image.resolveAssetSource(
    require("@/assets/images/pin4.png"),
  )?.uri;

  const htmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <style>
        html, body { margin: 0; padding: 0; height: 100%; }
        #map { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="map">Loading Kakao Map...</div>
      <script>
        (function(){
          function debug(msg) {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(String(msg));
            }
          }

          var appkey = "${KAKAO_JS_API_KEY}";
          var PIN_URI = "${pinUri}";


          if (!appkey) {
            document.getElementById("map").innerHTML = "<p style='color:red'>No Kakao API key</p>";
            debug("No API key found");
            return;
          }

          var s = document.createElement("script");
          s.src = "https://dapi.kakao.com/v2/maps/sdk.js?appkey=" + appkey + "&autoload=false";
          s.onload = function() {
            debug("Kakao SDK loaded");
            kakao.maps.load(function() {

              var container = document.getElementById("map");
              var options = {
                center: new kakao.maps.LatLng(${latitude}, ${longitude}),
                level: 3
              };
              var map = new kakao.maps.Map(container, options);

              var imageSize = new kakao.maps.Size(30, 40);
              var imageOption = { offset: new kakao.maps.Point(20, 40) }; // 아래 중앙이 좌표를 가리키도록
              var markerImage = new kakao.maps.MarkerImage(PIN_URI, imageSize, imageOption);

              // (옵션) 초기 중심 마커 - 기본마커 유지 원하면 주석
              var centerMarker = new kakao.maps.Marker({
                position: new kakao.maps.LatLng(${latitude}, ${longitude}),
                image: markerImage,
              });
              centerMarker.setMap(map);

              var pinMarker = null;

              // Function to get and send current map center
              function sendMapCenter() {
                var center = map.getCenter();
                var centerData = {
                  type: 'center_change',
                  lat: center.getLat(),
                  lng: center.getLng()
                };
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify(centerData));
                }
              }

              // Send initial center
              sendMapCenter();

              // Listen for map center changes (drag, zoom, etc.)
              kakao.maps.event.addListener(map, 'center_changed', function() {
                sendMapCenter();
              });

              kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
                var latlng = mouseEvent.latLng;

                if (!pinMarker) {
                  pinMarker = new kakao.maps.Marker({
                    position: latlng,
                    map: map,
                    image: markerImage
                  });
                } else {
                  pinMarker.setPosition(latlng);
                  if (!pinMarker.getMap()) pinMarker.setMap(map);
                }

                debug("Pin placed at: " + latlng.getLat().toFixed(6) + ", " + latlng.getLng().toFixed(6));
              });
            });
          };
          s.onerror = function() {
          };
          document.head.appendChild(s);
        })();
      </script>
    </body>
  </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="always"
        onMessage={(event) => {
          console.log("[KakaoMap WebView]:", event.nativeEvent.data);
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'center_change' && onCenterChange) {
              onCenterChange({ lat: data.lat, lng: data.lng });
            }
          } catch (e) {
            // Handle non-JSON messages (debug messages)
          }
        }}
        onError={(e) => console.log("[KakaoMap WebView] error:", e.nativeEvent)}
        onHttpError={(e) =>
          console.log("[KakaoMap WebView] HTTP error:", e.nativeEvent)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%" },
  webview: { flex: 1 },
});
