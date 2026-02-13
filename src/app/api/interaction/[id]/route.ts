import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/getUser';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const interaction = await prisma.interaction.findUnique({
      where: { id }
    });

    if (!interaction || interaction.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Interaction not found' },
        { status: 404 }
      );
    }

    await prisma.interaction.delete({
      where: { id }
    });

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
