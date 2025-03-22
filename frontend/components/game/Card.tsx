// src/components/game/Card.tsx
import React from "react";
import { Card as CardType } from "@/types/Card";
import Image from "next/image";
import styles from "./Card.module.css";

interface CardProps {
  card: CardType;
  onClick?: () => void;
  isSelected?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  size?: "sm" | "md" | "lg";
}

const Card: React.FC<CardProps> = ({
  card,
  onClick,
  isSelected = false,
  draggable = false,
  onDragStart,
  size = "md",
}) => {
  const sizeClasses = {
    sm: styles.cardSm,
    md: styles.cardMd,
    lg: styles.cardLg,
  };

  const rarityClasses = {
    common: styles.rarityCommon,
    uncommon: styles.rarityUncommon,
    rare: styles.rarityRare,
    legendary: styles.rarityLegendary,
  };

  // Get card image path based on card type
  const getCardImagePath = (cardType: string) => {
    // In a full implementation, this would return different images for each card type
    return `/assets/cards/${card.type}_1.png`;
  };

  // Get background pattern based on card type
  const getCardBackground = (cardType: string) => {
    const patterns = {
      warrior: styles.bgWarrior,
      archer: styles.bgArcher,
      healer: styles.bgHealer,
      tank: styles.bgTank,
      mage: styles.bgMage,
      scout: styles.bgScout,
    };

    return patterns[cardType as keyof typeof patterns] || styles.bgDefault;
  };

  return (
    <div
      className={`${styles.cardContainer} ${sizeClasses[size]} ${
        isSelected ? styles.cardSelected : ""
      } ${rarityClasses[card.rarity]}`}
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
    >
      {/* Pixel border */}
      <div className={styles.pixelBorder}></div>

      {/* Card Header */}
      <div className={styles.cardHeader}>
        <h3 className={styles.cardName}>{card.name}</h3>
      </div>

      {/* Card Image */}
      <div
        className={`${styles.imageContainer} ${getCardBackground(card.type)}`}
      >
        <div className={styles.imageWrapper}>
          <Image
            src={getCardImagePath(card.type)}
            alt={card.name}
            width={100}
            height={100}
            className={styles.cardImage}
          />
        </div>
        <div className={styles.cardType}>{card.type}</div>
        <div className={styles.cardRarity}>
          <span className={styles.rarityText}>{card.rarity}</span>
        </div>
      </div>

      {/* Card Stats */}
      <div className={styles.statsContainer}>
        <div className={styles.statItem}>
          <span className={`${styles.statIcon} ${styles.attackIcon}`}></span>
          <span className={styles.statValue}>{card.attack}</span>
        </div>
        <div className={styles.statItem}>
          <span className={`${styles.statIcon} ${styles.healthIcon}`}></span>
          <span className={styles.statValue}>{card.health}</span>
        </div>
        <div className={styles.statItem}>
          <span className={`${styles.statIcon} ${styles.rangeIcon}`}></span>
          <span className={styles.statValue}>{card.range}</span>
        </div>
      </div>

      {/* Card Description */}
      <div className={styles.descriptionContainer}>
        <p className={styles.description}>{card.description}</p>
      </div>

      {/* Special Ability */}
      {card.specialAbility && (
        <div className={styles.specialAbility}>
          <div className={styles.specialAbilityContent}>
            <span className={styles.specialAbilityIcon}></span>
            {card.specialAbility.name}
          </div>
        </div>
      )}

      {/* Selection indicator */}
      {isSelected && <div className={styles.selectionGlow}></div>}
    </div>
  );
};

export default Card;
