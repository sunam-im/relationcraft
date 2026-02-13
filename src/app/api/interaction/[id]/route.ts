import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE: Interaction 삭제
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Interaction 조회 (점수 업데이트용)
    const interaction = await prisma.interaction.findUnique({
      where: { id }
    });

    if (!interaction) {
      return NextResponse.json(
        { success: false, error: 'Interaction not found' },
        { status: 404 }
      );
    }

    // Interaction 삭제
    await prisma.interaction.delete({
      where: { id }
    });

    // 포스트맨의 Give/Take 점수 감소
    const postman = await prisma.postman.findUnique({
      where: { id: interaction.postmanId }
    });

    if (postman) {
      await prisma.postman.update({
        where: { id: interaction.postmanId },
        data: {
          giveScore: interaction.type === 'GIVE' 
            ? Math.max(0, postman.giveScore - 1) 
            : postman.giveScore,
          takeScore: interaction.type === 'TAKE' 
            ? Math.max(0, postman.takeScore - 1) 
            : postman.takeScore
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Interaction deleted successfully'
    });
  } catch (error) {
    console.error('DELETE /api/interaction/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete interaction' },
      { status: 500 }
    );
  }
}
