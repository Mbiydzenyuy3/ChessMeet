/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
// /* eslint-disable react-native/no-color-literals */
// /* eslint-disable react-native/no-inline-styles */
// // app/main/_layout.tsx
// import { COLORS } from '@/constants/colors';
// import { Chess, Square } from 'chess.js';
// import { useAudioPlayer } from 'expo-audio';
// import { useRouter } from 'expo-router';
// import { DoorOpenIcon, RotateCcwIcon } from 'lucide-react-native';
// import { useCallback, useRef, useState } from 'react';
// import { Dimensions, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
// import Chessboard, { ChessboardRef } from 'react-native-chessboard';
// import image from '../assets/images/woodenbg.jpg';
// import captureSound from '../assets/sound/capture.mp3';
// import moveSound from '../assets/sound/move-self.mp3';

// const router = useRouter();

// export default function Board() {
//   const chessboardRef = useRef<ChessboardRef>(null);
//   const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
//   const [validMoves, setValidMoves] = useState<Square[]>([]);
//   const chess = useRef(new Chess()).current;
//   const [fen, setFen] = useState(chess.fen());

//   const movePlayer = useAudioPlayer(moveSound);
//   const capPlayer = useAudioPlayer(captureSound);

//   const handlePress = useCallback(
//     async (box: Square) => {
//       // Logic for a second tap to move a piece
//       if (selectedSquare) {
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
//           chess.move({ from: selectedSquare, to: box });

//           if (moveRes.captured) {
//             capPlayer.play();
//           } else {
//             movePlayer.play();
//           }

//           setSelectedSquare(null);
//           setValidMoves([]);
//         } else {
//           setSelectedSquare(null);
//           setValidMoves([]);
//         }
//       } else {
//         // Logic for a first tap to select a piece
//         const moves = chess.moves({ square: box, verbose: true });
//         if (moves.length > 0) {
//           setSelectedSquare(box);
//           setValidMoves(moves.map((move) => move.to));
//         } else {
//           setSelectedSquare(null);
//           setValidMoves([]);
//         }
//       }
//     },
//     [selectedSquare, validMoves, chess]
//   );

//   const boardColor = {
//     black: '#481f01',
//     white: '#eeeed2',
//     lastMoveHighlight: 'rgba(255, 255, 0, 0.5)',
//     checkmateHighlight: '#E84855',
//     promotionPieceButton: '#FF9B71',
//     moveIndicator: 'rgba(255, 255, 0, 0.6)',
//   };
//   const { width } = Dimensions.get('window');
//   const boardSize = width > 500 ? 500 : width;
//   const squareSize = boardSize / 8;

//   const listenTapWithDots = () => {
//     const squareList = [];
//     const file = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
//     const rank = [1, 2, 3, 4, 5, 6, 7, 8];

//     for (let i = 0; i < 8; i++) {
//       for (let x = 0; x < 8; x++) {
//         const square = `${file[x]}${rank[7 - i]}` as Square;
//         const isSelected = selectedSquare === square;
//         const isMove = validMoves.includes(square);

//         squareList.push(
//           <Pressable
//             key={square}
//             onPress={() => handlePress(square)}
//             style={{
//               position: 'absolute',
//               width: squareSize,
//               height: squareSize,
//               left: x * squareSize,
//               top: i * squareSize,
//               justifyContent: 'center',
//               alignItems: 'center',
//             }}
//           >
//             {isMove && (
//               <View
//                 style={{
//                   ...styles.dot,
//                   backgroundColor: boardColor.moveIndicator,
//                 }}
//               />
//             )}
//             {isSelected && (
//               <View
//                 style={{
//                   ...styles.dot,
//                   backgroundColor: boardColor.lastMoveHighlight,
//                 }}
//               />
//             )}
//           </Pressable>
//         );
//       }
//     }
//     return squareList;
//   };
//   return (
//     <ImageBackground source={image} resizeMode="cover" style={styles.backgroundImage}>
//       <View style={styles.overlay}>
//         <View style={styles.screen}>
//           {/* Board Area */}
//           <Chessboard
//             ref={chessboardRef}
//             fen={fen}
//             colors={boardColor}
//             showMoveIndicator={false} // try this (some versions support it)
//             style={{ zIndex: 0 }}
//           />
//           <View
//             style={[
//               StyleSheet.absoluteFillObject,
//               { zIndex: 9999, backgroundColor: 'rgba(255,0,0,0.15)' },
//             ]}
//           >
//             {listenTapWithDots()}
//           </View>
//         </View>
//         {/* Controls */}
//         <View style={styles.controls}>
//           <Pressable
//             style={styles.button}
//             onPress={() => {
//               chess.reset();
//               setFen(chess.fen());
//               chessboardRef.current?.resetBoard();
//               setSelectedSquare(null);
//               setValidMoves([]);
//             }}
//           >
//             <RotateCcwIcon size={32} color="white" />
//             <Text style={styles.text}>Reset</Text>
//           </Pressable>

//           <Pressable
//             style={styles.button}
//             onPress={() => {
//               chess.reset();
//               setFen(chess.fen());
//               setSelectedSquare(null);
//               setValidMoves([]);
//               router.back();
//             }}
//           >
//             <DoorOpenIcon size={32} color="white" />
//             <Text style={styles.text}>Exit</Text>
//           </Pressable>
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
//   // container: {
//   //   aspectRatio: 1,
//   //   alignItems: 'center',
//   //   justifyContent: 'center',
//   //   paddingBottom: 20,
//   // },
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
//     backgroundColor: COLORS.layer,
//     width: '100%',
//     height: '100%',
//     paddingBlock: 40,
//     alignItems: 'center',
//   },
//   dot: {
//     width: 20,
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
import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Chessboard, { ChessboardRef } from 'react-native-chessboard';
import image from '../assets/images/woodenbg.jpg';
import captureSound from '../assets/sound/capture.mp3';
import moveSound from '../assets/sound/move-self.mp3';

const router = useRouter();

type PromotionData = {
  from: Square;
  to: Square;
};

type Piece = 'q' | 'r' | 'b' | 'n';

interface PromotionModalProps {
  visible: boolean;
  onSelectPiece: (piece: Piece) => void;
  playerColor: 'w' | 'b';
}

const PromotionModal = ({ visible, onSelectPiece, playerColor }: PromotionModalProps) => {
  const pieces: Piece[] = ['q', 'r', 'b', 'n'];
  const pieceImages: { [key: string]: string } = {
    wq: 'https://images.chesscomfiles.com/images/40/32/120x120/wq.png',
    wr: 'https://images.chesscomfiles.com/images/40/32/120x120/wr.png',
    wb: 'https://images.chesscomfiles.com/images/40/32/120x120/wb.png',
    wn: 'https://images.chesscomfiles.com/images/40/32/120x120/wn.png',
    bq: 'https://images.chesscomfiles.com/images/40/32/120x120/bq.png',
    br: 'https://images.chesscomfiles.com/images/40/32/120x120/br.png',
    bb: 'https://images.chesscomfiles.com/images/40/32/120x120/bb.png',
    bn: 'https://images.chesscomfiles.com/images/40/32/120x120/bn.png',
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={() => {}}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Promote Pawn</Text>
          <View style={styles.promoChoices}>
            {pieces.map((piece) => {
              const imageKey = `${playerColor}${piece}`;
              return (
                <Pressable
                  key={piece}
                  style={styles.promoButton}
                  onPress={() => onSelectPiece(piece)}
                >
                  <Image source={{ uri: pieceImages[imageKey] }} style={styles.promoImage} />
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function Board() {
  const chessboardRef = useRef<ChessboardRef>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [validMoves, setValidMoves] = useState<Square[]>([]);
  const chess = useRef(new Chess()).current;
  const [fen, setFen] = useState(chess.fen());
  const [promotion, setPromotion] = useState<PromotionData | null>(null);

  const movePlayer = useAudioPlayer(moveSound);
  const capPlayer = useAudioPlayer(captureSound);

  const handlePress = useCallback(
    async (box: Square) => {
      if (promotion) return; // prevent clicks while waiting for promotion

      if (selectedSquare) {
        const validMoveToBox = validMoves.includes(box);

        if (validMoveToBox) {
          // check if this move is a promotion
          const isPromotion =
            chess.get(selectedSquare)?.type === 'p' &&
            ((chess.turn() === 'w' && box.endsWith('8')) ||
              (chess.turn() === 'b' && box.endsWith('1')));

          if (isPromotion) {
            setPromotion({ from: selectedSquare, to: box });
            return;
          }

          const moveRes = await chessboardRef.current?.move({
            from: selectedSquare,
            to: box,
          });

          if (!moveRes) {
            setSelectedSquare(null);
            setValidMoves([]);
            return;
          }

          chess.move({ from: selectedSquare, to: box });
          setFen(chess.fen());

          if (moveRes.captured) capPlayer.play();
          else movePlayer.play();

          setSelectedSquare(null);
          setValidMoves([]);
        } else {
          setSelectedSquare(null);
          setValidMoves([]);
        }
      } else {
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
    [selectedSquare, validMoves, chess, promotion, capPlayer, movePlayer]
  );

  const handlePromotion = async (piece: 'q' | 'r' | 'b' | 'n') => {
    if (!promotion) return;

    chess.move({
      from: promotion.from,
      to: promotion.to,
      promotion: piece,
    });

    await (chessboardRef.current as any)?.move({
      from: promotion.from,
      to: promotion.to,
      promotion: piece, // Add promotion here so react-native-chessboard updates correctly
    });

    setFen(chess.fen());
    movePlayer.play();
    setPromotion(null);
    setSelectedSquare(null);
    setValidMoves([]);
  };

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
          <Chessboard
            ref={chessboardRef}
            fen={fen}
            colors={boardColor}
            showMoveIndicator={false}
            promotionDialog={false} // Disable default promotion dialog
            style={{ zIndex: 0 }}
          />
          {!promotion && (
            <View
              style={[
                StyleSheet.absoluteFillObject,
                { zIndex: 9999, backgroundColor: 'rgba(255,0,0,0.15)' },
              ]}
            >
              {listenTapWithDots()}
            </View>
          )}
        </View>
        <PromotionModal
          visible={!!promotion}
          onSelectPiece={handlePromotion}
          playerColor={chess.turn()}
        />

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            style={styles.button}
            onPress={() => {
              chess.reset();
              setFen(chess.fen());
              chessboardRef.current?.resetBoard();
              setSelectedSquare(null);
              setValidMoves([]);
              setPromotion(null);
            }}
          >
            <RotateCcwIcon size={32} color="white" />
            <Text style={styles.text}>Reset</Text>
          </Pressable>

          <Pressable
            style={styles.button}
            onPress={() => {
              chess.reset();
              setFen(chess.fen());
              setSelectedSquare(null);
              setValidMoves([]);
              setPromotion(null);
              router.back();
            }}
          >
            <DoorOpenIcon size={32} color="white" />
            <Text style={styles.text}>Exit</Text>
          </Pressable>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  promoChoices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
  },
  promoButton: {
    margin: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  promoImage: {
    width: 60,
    height: 60,
  },
});
