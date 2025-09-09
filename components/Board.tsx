// /* eslint-disable react-native/no-color-literals */
// /* eslint-disable react-native/no-inline-styles */
// // app/main/_layout.tsx
// import { COLORS } from '@/constants/colors';
// import { Chess, Square } from 'chess.js';
// import { useAudioPlayer } from 'expo-audio';
// import { useRouter } from 'expo-router';
// import { DoorOpenIcon, RotateCcwIcon } from 'lucide-react-native';
// import { useCallback, useRef, useState } from 'react';
// import { Dimensions, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native'; // ✅ Import Dimensions
// import Chessboard, { ChessboardRef } from 'react-native-chessboard';
// import image from '../assets/images/woodenbg.jpg';
// import captureSound from '../assets/sound/capture.mp3';
// import moveSound from '../assets/sound/move-self.mp3';

// const router = useRouter();

// export default function Board() {
//   const chessboardRef = useRef<ChessboardRef>(null);
//   const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
//   const [validMoves, setValidMoves] = useState<Square[]>([]); // ✅ State to track legal moves
//   const chess = useRef(new Chess()).current;
//   const [fen, setFen] = useState(chess.fen());

//   const movePlayer = useAudioPlayer(moveSound);
//   const capPlayer = useAudioPlayer(captureSound);

//   const handlePress = useCallback(
//     async (box: Square) => {
//       // If a square is already selected, try to move to the new box
//       if (selectedSquare) {
//         // Find if the target box is a valid move
//         const validMoveToBox = validMoves.includes(box);

//         if (validMoveToBox) {
//           const moveRes = await chessboardRef.current?.move({
//             from: selectedSquare,
//             to: box,
//           });

//           if (!moveRes) {
//             setSelectedSquare(null);
//             setValidMoves([]);
//             return;
//           }

//           setFen(chess.fen());

//           if (moveRes.captured) {
//             capPlayer.play();
//           } else {
//             movePlayer.play();
//           }

//           setSelectedSquare(null);
//           setValidMoves([]);
//         } else {
//           // If the move is invalid, just clear the selection
//           setSelectedSquare(null);
//           setValidMoves([]);
//         }
//       } else {
//         // If no square is selected, get the valid moves for the piece on the tapped square
//         const moves = chess.moves({ square: box, verbose: true });
//         if (moves.length > 0) {
//           setSelectedSquare(box);
//           setValidMoves(moves.map((move) => move.to));
//         } else {
//           // If a square with no piece or no valid moves is tapped, clear selection
//           setSelectedSquare(null);
//           setValidMoves([]);
//         }
//       }
//     },
//     [selectedSquare, validMoves, chess]
//   );

//   // The 'listenTap' function is no longer needed. We will render the Pressable squares directly
//   // inside a new overlay View to avoid the 'listenTap' not found error.

//   const boardColor = {
//     black: '#481f01',
//     white: '#eeeed2',
//     lastMoveHighlight: '#008000',
//     checkmateHighlight: '#E84855',
//     promotionPieceButton: '#FF9B71',
//   };

//   const { width } = Dimensions.get('window');
//   const boardSize = width > 500 ? 500 : width;
//   const squareSize = boardSize / 8;

//   return (
//     <ImageBackground source={image} resizeMode="cover" style={styles.backgroundImage}>
//       <View style={styles.overlay}>
//         <View style={styles.screen}>
//           {/* Board Area */}
//           <View style={[styles.container, { width: boardSize, height: boardSize }]}>
//             <Chessboard
//               ref={chessboardRef}
//               durations={{ move: 200 }}
//               fen={fen}
//               colors={boardColor}
//             />

//             {/* ✅ This overlay handles all taps and renders the move indicator dots */}
//             <View style={StyleSheet.absoluteFillObject}>
//               {Array.from({ length: 64 }).map((_, idx) => {
//                 const fileIndex = idx % 8;
//                 const rankIndex = Math.floor(idx / 8);
//                 const file = String.fromCharCode('a'.charCodeAt(0) + fileIndex);
//                 const rank = 8 - rankIndex;
//                 const square = `${file}${rank}` as Square;
//                 const isSelected = selectedSquare === square;
//                 const isMove = validMoves.includes(square);

//                 return (
//                   <Pressable
//                     key={square}
//                     onPress={() => handlePress(square)}
//                     style={{
//                       position: 'absolute',
//                       width: squareSize,
//                       height: squareSize,
//                       left: fileIndex * squareSize,
//                       top: rankIndex * squareSize,
//                       justifyContent: 'center',
//                       alignItems: 'center',
//                     }}
//                   >
//                     {isSelected && (
//                       <View
//                         style={[styles.dot, { backgroundColor: boardColor.lastMoveHighlight }]}
//                       />
//                     )}
//                     {isMove && (
//                       <View
//                         style={[styles.dot, { backgroundColor: boardColor.lastMoveHighlight }]}
//                       />
//                     )}
//                   </Pressable>
//                 );
//               })}
//             </View>
//           </View>

//           {/* Controls */}
//           <View style={styles.controls}>
//             <Pressable style={styles.button} onPress={() => chessboardRef.current?.resetBoard()}>
//               <RotateCcwIcon size={32} color="white" />
//               <Text style={styles.text}>Reset</Text>
//             </Pressable>

//             <Pressable style={styles.button} onPress={() => router.back()}>
//               <DoorOpenIcon size={32} color="white" />
//               <Text style={styles.text}>Exit</Text>
//             </Pressable>
//           </View>
//         </View>
//       </View>
//     </ImageBackground>
//   );
// }

// const styles = StyleSheet.create({
//   screen: {
//     flex: 1,
//   },
//   backgroundImage: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   container: {
//     aspectRatio: 1, // ✅ Keep the board square
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingBottom: 20,
//   },
//   controls: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     paddingVertical: 12,
//     marginBottom: 5,
//   },
//   button: {
//     alignItems: 'center',
//     paddingHorizontal: 16,
//   },
//   text: {
//     fontSize: 16,
//     color: COLORS.white,
//     marginTop: 4,
//     textAlign: 'center',
//     fontWeight: '600',
//   },
//   overlay: {
//     flex: 1,
//     backgroundColor: COLORS.overlay,
//     width: '100%',
//     height: '100%', // ✅ Use 100% instead of a fixed value
//     paddingBlock: 40,
//     alignItems: 'center',
//   },
//   dot: {
//     width: 20, // ✅ Use a fixed size for the dot
//     height: 20,
//     opacity: 0.7,
//     borderRadius: 10,
//   },
// });

/* eslint-disable react-native/no-color-literals */
/* eslint-disable react-native/no-inline-styles */
// app/main/_layout.tsx
import { COLORS } from '@/constants/colors';
import { Chess, Square } from 'chess.js';
import { useAudioPlayer } from 'expo-audio';
import { useRouter } from 'expo-router';
import { DoorOpenIcon, RotateCcwIcon } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { Dimensions, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import Chessboard, { ChessboardRef } from 'react-native-chessboard';
import image from '../assets/images/woodenbg.jpg';
import captureSound from '../assets/sound/capture.mp3';
import moveSound from '../assets/sound/move-self.mp3';

const router = useRouter();

export default function Board() {
  const chessboardRef = useRef<ChessboardRef>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const chess = useRef(new Chess()).current;
  const [fen, setFen] = useState(chess.fen());

  const movePlayer = useAudioPlayer(moveSound);
  const capPlayer = useAudioPlayer(captureSound);

  const handlePress = useCallback(
    async (box: Square) => {
      // Logic for a second tap to move a piece
      if (selectedSquare) {
        const validMoveToBox = validMoves.includes(box);

        if (validMoveToBox) {
          const moveRes = await chessboardRef.current?.move({
            from: selectedSquare,
            to: box,
          });

          if (!moveRes) {
            setSelectedSquare(null);
            setValidMoves([]);
            return;
          }

          setFen(chess.fen());
          chess.move({ from: selectedSquare, to: box });

          if (moveRes.captured) {
            capPlayer.play();
          } else {
            movePlayer.play();
          }

          setSelectedSquare(null);
          setValidMoves([]);
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      } else {
        // Logic for a first tap to select a piece
        const moves = chess.moves({ square: box, verbose: true });
        if (moves.length > 0) {
          setSelectedSquare(box);
          setValidMoves(moves.map((move) => move.to));
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      }
    },
    [selectedSquare, validMoves, chess]
  );

  const boardColor = {
    black: '#481f01',
    white: '#eeeed2',
    lastMoveHighlight: 'rgba(255, 255, 0, 0.5)',
    checkmateHighlight: '#E84855',
    promotionPieceButton: '#FF9B71',
    moveIndicator: 'rgba(255, 255, 0, 0.6)',
  };
  const { width } = Dimensions.get('window');
  const boardSize = width > 500 ? 500 : width;
  const squareSize = boardSize / 8;

  const listenTapWithDots = () => {
    const squareList = [];
    const file = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const rank = [1, 2, 3, 4, 5, 6, 7, 8];

    for (let i = 0; i < 8; i++) {
      for (let x = 0; x < 8; x++) {
        const square = `${file[x]}${rank[7 - i]}` as Square;
        const isSelected = selectedSquare === square;
        const isMove = validMoves.includes(square);

        squareList.push(
          <Pressable
            key={square}
            onPress={() => handlePress(square)}
            style={{
              position: 'absolute',
              width: squareSize,
              height: squareSize,
              left: x * squareSize,
              top: i * squareSize,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {isMove && (
              <View
                style={{
                  ...styles.dot,
                  backgroundColor: boardColor.moveIndicator,
                }}
              />
            )}
            {isSelected && (
              <View
                style={{
                  ...styles.dot,
                  backgroundColor: boardColor.lastMoveHighlight,
                }}
              />
            )}
          </Pressable>
        );
      }
    }
    return squareList;
  };
  return (
    <ImageBackground source={image} resizeMode="cover" style={styles.backgroundImage}>
      <View style={styles.overlay}>
        <View style={styles.screen}>
          {/* Board Area */}
          <Chessboard
            ref={chessboardRef}
            fen={fen}
            colors={boardColor}
            showMoveIndicator={false} // try this (some versions support it)
            style={{ zIndex: 0 }}
          />
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { zIndex: 9999, backgroundColor: 'rgba(255,0,0,0.15)' },
            ]}
          >
            {listenTapWithDots()}
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <Pressable style={styles.button} onPress={() => chessboardRef.current?.resetBoard()}>
              <RotateCcwIcon size={32} color="white" />
              <Text style={styles.text}>Reset</Text>
            </Pressable>

            <Pressable style={styles.button} onPress={() => router.back()}>
              <DoorOpenIcon size={32} color="white" />
              <Text style={styles.text}>Exit</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 5,
  },
  button: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  text: {
    fontSize: 16,
    color: COLORS.white,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: COLORS.layer,
    width: '100%',
    height: '100%',
    paddingBlock: 40,
    alignItems: 'center',
  },
  dot: {
    width: 20,
    height: 20,
    opacity: 0.7,
    borderRadius: 10,
  },
});
