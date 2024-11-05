# utils/cache.py
import os
import shutil
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class CacheManager:
    def __init__(self):
        self.cache_dir = Path("temp/uploads")
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
    @staticmethod
    def generate_cache_key(content: bytes, filename: str) -> str:
        """生成缓存文件的唯一标识符"""
        content_hash = hashlib.md5(content).hexdigest()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"{timestamp}_{content_hash}_{filename}"
    
    def save_pdf(self, file_content: bytes, filename: str) -> str:
        """
        保存PDF文件到缓存目录
        
        Args:
            file_content: PDF文件的二进制内容
            filename: 原始文件名
            
        Returns:
            str: 缓存文件的完整路径
        """
        try:
            cache_key = self.generate_cache_key(file_content, filename)
            cache_path = self.cache_dir / cache_key
            
            with open(cache_path, "wb") as f:
                f.write(file_content)
                
            logger.info(f"File cached successfully: {cache_path}")
            return str(cache_path.absolute())
            
        except Exception as e:
            logger.error(f"Error saving file to cache: {str(e)}")
            raise

    def delete_pdf(self, cache_path: str) -> None:
        """
        从缓存中删除PDF文件
        
        Args:
            cache_path: 缓存文件的路径
        """
        try:
            cache_file = Path(cache_path)
            if cache_file.exists():
                cache_file.unlink()
                logger.info(f"Cache file deleted: {cache_path}")
            else:
                logger.warning(f"Cache file not found: {cache_path}")
                
        except Exception as e:
            logger.error(f"Error deleting cache file: {str(e)}")
            raise
    
    def cleanup_expired_cache(self, max_age_hours: int = 1) -> None:
        """
        清理过期的缓存文件
        
        Args:
            max_age_hours: 缓存文件的最大保留时间（小时）
        """
        try:
            now = datetime.now()
            for cache_file in self.cache_dir.glob("*"):
                file_age = datetime.fromtimestamp(cache_file.stat().st_mtime)
                age_hours = (now - file_age).total_seconds() / 3600
                
                if age_hours > max_age_hours:
                    cache_file.unlink()
                    logger.info(f"Deleted expired cache file: {cache_file}")
                    
        except Exception as e:
            logger.error(f"Error cleaning up cache: {str(e)}")
            raise
