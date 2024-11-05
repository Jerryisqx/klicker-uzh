# utils/prisma.py
import logging
from prisma import Prisma
from contextlib import contextmanager
from typing import Generator, Optional
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class PrismaClient:
    def __init__(self):
        self.db = Prisma()
        self._connect()
    
    @classmethod
    def _connect(self):
        """Connect to the database"""
        try:
            self.db.connect()
            logger.info("Successfully connected to database")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
    
    @classmethod
    async def cleanup(self):
        """
        清理Prisma客户端连接
        """
        try:
            await self.db.disconnect()
            logger.info("Prisma client disconnected successfully")
        except Exception as e:
            logger.error(f"Error disconnecting Prisma client: {str(e)}")
            raise